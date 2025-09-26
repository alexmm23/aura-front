import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { API, buildApiUrl, isWeb } from '../config/api';
import { apiGet, apiPost, apiPostNoAuth } from '../utils/fetchWithAuth';

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
            const response=await apiPostNoAuth(API.ENDPOINTS.AUTH.REFRESH_TOKEN, {
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
                        if (result) {
                            const newAccessToken=result.token||result.accessToken;
                            const newRefreshToken=result.refreshToken;

                            if (newAccessToken&&newRefreshToken) {
                                await AsyncStorage.setItem('userToken', newAccessToken);
                                await AsyncStorage.setItem('refreshToken', newRefreshToken);
                                setIsAuthenticated(true);
                                decodeAndSetUser(newAccessToken);
                            } else {
                                setIsAuthenticated(false);
                                await clearAuthData();
                            }
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
        console.log('=== LOGIN DEBUG START ===');
        console.log('Received credentials:', credentials);
        console.log('Platform:', isWeb()? 'web':'mobile');
        console.log('API URL from config:', buildApiUrl(''));

        try {
            // Validar que las credenciales existan y tengan las propiedades correctas
            if (!credentials) {
                console.error('Credentials is null or undefined');
                throw new Error('Las credenciales son requeridas');
            }

            if (typeof credentials!=='object') {
                console.error('Credentials is not an object:', typeof credentials);
                throw new Error('Formato de credenciales inválido');
            }

            if (!credentials.email) {
                console.error('Email is missing from credentials');
                throw new Error('El email es requerido');
            }

            if (!credentials.password) {
                console.error('Password is missing from credentials');
                throw new Error('La contraseña es requerida');
            }

            if (isWeb()) {
                console.log('Using web login endpoint');
                // Para web, usar POST /auth/login/web con email y password usando apiPostNoAuth
                const response=await apiPostNoAuth(API.ENDPOINTS.AUTH.LOGIN_WEB, {
                    email: credentials.email.trim(),
                    password: credentials.password
                });

                console.log('Web login response status:', response.status);
                if (response.ok) {
                    const data=await response.json();
                    console.log('Login web exitoso:', data);

                    if (!data) {
                        throw new Error('No se recibió respuesta del servidor');
                    }

                    setIsAuthenticated(true);
                    if (data.user) {
                        setUser(data.user);
                    }
                    return { success: true, data };
                } else {
                    const errorData=await response.json().catch(() => ({ message: 'Error de servidor' }));
                    console.error('Error en login web:', errorData);
                    setIsAuthenticated(false);
                    setUser(null);
                    return { success: false, error: errorData.message||'Error de autenticación' };
                }
            } else {
                console.log('Using mobile login endpoint');
                // Para móvil, usar POST /auth/login con email y password usando apiPostNoAuth
                const response=await apiPostNoAuth(API.ENDPOINTS.AUTH.LOGIN, {
                    email: credentials.email.trim(),
                    password: credentials.password
                });

                console.log('Mobile login response status:', response.status);
                if (response.ok) {
                    const data=await response.json();
                    console.log('Login móvil response:', data);
                    console.log('Response data structure:', {
                        hasToken: !!data.token,
                        hasAccessToken: !!data.accessToken,
                        hasRefreshToken: !!data.refreshToken,
                        message: data.message
                    });

                    if (!data) {
                        throw new Error('No se recibió respuesta del servidor');
                    }

                    // Validar que se recibieron los tokens
                    const accessToken=data.token||data.accessToken;
                    const refreshToken=data.refreshToken;

                    if (!accessToken||!refreshToken) {
                        console.error('Missing tokens in response:', {
                            hasToken: !!data.token,
                            hasAccessToken: !!data.accessToken,
                            hasRefreshToken: !!data.refreshToken
                        });
                        throw new Error('Tokens no recibidos del servidor');
                    }

                    // Guardar los tokens recibidos
                    await AsyncStorage.setItem('userToken', accessToken);
                    await AsyncStorage.setItem('refreshToken', refreshToken);

                    console.log('Login móvil exitoso - tokens guardados');
                    setIsAuthenticated(true);

                    // Decodificar y validar el token
                    try {
                        const decodedToken=jwtDecode(accessToken);
                        console.log('Decoded token:', decodedToken);
                        if (!decodedToken.userId&&!decodedToken.id) {
                            console.error('Token inválido: no contiene userId/id');
                            throw new Error('Token inválido recibido');
                        }
                        setUser(decodedToken);
                    } catch (decodeError) {
                        console.error('Error decoding token:', decodeError);
                        // Continuar con login exitoso pero sin datos de usuario
                        setUser(null);
                    }

                    return { success: true, data };
                } else {
                    const errorData=await response.json().catch(() => ({ message: 'Error de servidor' }));
                    console.error('Error en login móvil:', errorData);

                    // Limpiar cualquier token parcial en caso de error
                    try {
                        await AsyncStorage.removeItem('userToken');
                        await AsyncStorage.removeItem('refreshToken');
                    } catch (cleanupError) {
                        console.error('Error cleaning up tokens:', cleanupError);
                    }

                    setIsAuthenticated(false);
                    setUser(null);
                    return { success: false, error: errorData.message||errorData.error||'Error de autenticación' };
                }
            }
        } catch (error) {
            console.error('Error durante el login:', error);
            console.log('=== LOGIN DEBUG END (ERROR) ===');

            // Limpiar estado en caso de error
            setIsAuthenticated(false);
            setUser(null);

            // Limpiar tokens en móvil en caso de error
            if (!isWeb()) {
                try {
                    await AsyncStorage.removeItem('userToken');
                    await AsyncStorage.removeItem('refreshToken');
                } catch (cleanupError) {
                    console.error('Error cleaning up tokens after login error:', cleanupError);
                }
            }

            return {
                success: false,
                error: error.message||'Error de conexión. Verifica tu internet.'
            };
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
