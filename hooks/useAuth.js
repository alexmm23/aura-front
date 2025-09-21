import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { API, buildApiUrl, isWeb } from '../config/api';
import { apiGet, apiPost } from '../utils/fetchWithAuth';

function getPathname() {
    return typeof window!=='undefined'? window.location.pathname:'';
}

async function clearAuthData() {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('refreshToken');
}

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated]=useState(false);
    const [isLoading, setIsLoading]=useState(true);
    const [user, setUser]=useState(null);

    const isTokenExpired=async (token) => {
        try {
            const response=await apiPost(API.ENDPOINTS.AUTH.VERIFY_TOKEN, { token });
            if (!response.ok) throw new Error('Token inválido o expirado');
            const data=await response.json();
            return data.expired;
        } catch (error) {
            console.error('Error al verificar el token:', error);
            return true;
        }
    };

    const decodeAndSetUser=(token) => {
        try {
            setUser(jwtDecode(token));
        } catch (e) {
            setUser(null);
            console.error('Error al decodificar el token:', e);
        }
    };

    const refreshAccessToken=async (refreshToken) => {
        try {
            const response=await apiPost(API.ENDPOINTS.AUTH.REFRESH_TOKEN, {
                refreshToken: refreshToken
            });
            if (!response.ok) throw new Error('No se pudo renovar el token');
            const data=await response.json();
            return data;
        } catch (error) {
            console.error('Error al renovar el token:', error);
            return null;
        }
    };

    useEffect(() => {
        const checkAuthStatus=async () => {
            try {
                setIsLoading(true);

                if (isWeb()) {
                    // Para web, verificar cookies con el servidor usando apiGet
                    try {
                        const response=await apiGet(API.ENDPOINTS.AUTH.AUTH_CHECK);

                        if (response.ok) {
                            const data=await response.json();
                            console.log('Auth check web exitoso:', data);
                            setIsAuthenticated(true);
                            if (data.user) {
                                setUser(data.user);
                            }
                        } else {
                            console.log('No hay sesión web válida');
                            setIsAuthenticated(false);
                        }
                    } catch (error) {
                        console.error('Error verificando auth web:', error);
                        setIsAuthenticated(false);
                    }
                } else {
                    // Para móvil, verificar tokens locales
                    const token=await AsyncStorage.getItem('userToken');
                    const refreshToken=await AsyncStorage.getItem('refreshToken');

                    if (!token&&!refreshToken) {
                        setIsAuthenticated(false);
                        return;
                    }

                    if (token&&!(await isTokenExpired(token))) {
                        setIsAuthenticated(true);
                        decodeAndSetUser(token);
                    } else if (refreshToken) {
                        const result=await refreshAccessToken(refreshToken);
                        if (result&&result.accessToken&&result.refreshToken) {
                            await AsyncStorage.setItem('userToken', result.accessToken);
                            await AsyncStorage.setItem('refreshToken', result.refreshToken);
                            setIsAuthenticated(true);
                            decodeAndSetUser(result.accessToken);
                        } else {
                            setIsAuthenticated(false);
                            await clearAuthData();
                        }
                    } else {
                        setIsAuthenticated(false);
                        await clearAuthData();
                    }
                }
            } catch (error) {
                console.error('Error en checkAuthStatus:', error);
                setIsAuthenticated(false);
                if (!isWeb()) {
                    await clearAuthData();
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const login=async (credentials) => {
        try {
            if (isWeb()) {
                // Para web, usar POST /auth/login/web con email y password usando apiPost
                const response=await apiPost(API.ENDPOINTS.AUTH.LOGIN_WEB, {
                    email: credentials.email,
                    password: credentials.password
                });

                if (response.ok) {
                    const data=await response.json();
                    console.log('Login web exitoso:', data);
                    setIsAuthenticated(true);
                    if (data.user) {
                        setUser(data.user);
                    }
                    return { success: true, data };
                } else {
                    const errorData=await response.json().catch(() => ({}));
                    console.error('Error en login web:', errorData);
                    return { success: false, error: errorData.message||'Error de autenticación' };
                }
            } else {
                // Para móvil, usar POST /auth/login con email y password usando apiPost
                const response=await apiPost(API.ENDPOINTS.AUTH.LOGIN, {
                    email: credentials.email,
                    password: credentials.password
                });

                if (response.ok) {
                    const data=await response.json();
                    // Guardar los tokens recibidos
                    if (data.accessToken) {
                        await AsyncStorage.setItem('userToken', data.accessToken);
                    }
                    if (data.refreshToken) {
                        await AsyncStorage.setItem('refreshToken', data.refreshToken);
                    }
                    console.log('Login móvil exitoso');
                    setIsAuthenticated(true);
                    if (data.accessToken) {
                        decodeAndSetUser(data.accessToken);
                    }
                    return { success: true, data };
                } else {
                    const errorData=await response.json().catch(() => ({}));
                    console.error('Error en login móvil:', errorData);
                    return { success: false, error: errorData.message||errorData.error||'Error de autenticación' };
                }
            }
        } catch (error) {
            console.error('Error durante el login:', error);
            return { success: false, error: 'Error de conexión' };
        }
    };

    const logout=async (logoutAll=false) => {
        try {
            if (isWeb()) {
                // Para web, usar /auth/logout que maneja cookies httpOnly usando apiPost
                const endpoint=logoutAll? API.ENDPOINTS.AUTH.LOGOUT_ALL:API.ENDPOINTS.AUTH.LOGOUT;
                await apiPost(endpoint);
            } else {
                // Para móvil, usar /auth/logout o /auth/logout/all usando apiPost
                const endpoint=logoutAll? API.ENDPOINTS.AUTH.LOGOUT_ALL:API.ENDPOINTS.AUTH.LOGOUT;
                await apiPost(endpoint);
                await clearAuthData();
            }
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Error durante logout:', error);
            // Limpiar estado local aunque falle el request
            setIsAuthenticated(false);
            setUser(null);
            if (!isWeb()) {
                await clearAuthData();
            }
        }
    };

    const logoutAllDevices=async () => {
        return await logout(true);
    };

    return {
        isAuthenticated,
        isLoading,
        login,
        logout,
        logoutAllDevices,
        user,
    };
}
