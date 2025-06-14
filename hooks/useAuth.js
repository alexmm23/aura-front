import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { API, buildApiUrl } from '../config/api';

function getPathname() {
    return typeof window !== 'undefined' ? window.location.pathname : '';
}

async function clearAuthData() {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('refreshToken');
}

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    const isTokenExpired = async (token) => {
        try {
            const response = await fetch(buildApiUrl(API.ENDPOINTS.AUTH.VERIFY_TOKEN), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            if (!response.ok) throw new Error('Token inválido o expirado');
            const data = await response.json();
            return data.expired;
        } catch (error) {
            console.error('Error al verificar el token:', error);
            return true;
        }
    };

    const decodeAndSetUser = (token) => {
        try {
            setUser(jwtDecode(token));
        } catch (e) {
            setUser(null);
            console.error('Error al decodificar el token:', e);
        }
    };

    const refreshAccessToken = async (refreshToken) => {
        try {
            const response = await fetch(buildApiUrl(API.ENDPOINTS.AUTH.REFRESH_TOKEN), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
            if (!response.ok) throw new Error('No se pudo renovar el token');
            return await response.json();
        } catch (error) {
            console.error('Error al renovar el token:', error);
            return null;
        }
    };

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                
                if (!token && !refreshToken) {
                    setIsAuthenticated(false);
                    return;
                }
                
                if (token && !(await isTokenExpired(token))) {
                    // decodeAndSetUser(token);
                    setIsAuthenticated(true);
                } else if (refreshToken) {
                    const result = await refreshAccessToken(refreshToken);
                    if (result && result.accessToken && result.refreshToken) {
                        await AsyncStorage.setItem('userToken', result.accessToken);
                        await AsyncStorage.setItem('refreshToken', result.refreshToken);
                        // decodeAndSetUser(result.accessToken);
                        setIsAuthenticated(true);
                    } else {
                        setIsAuthenticated(false);
                        await clearAuthData();
                    }
                } else {
                    setIsAuthenticated(false);
                    await clearAuthData();
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                setIsAuthenticated(false);
                await clearAuthData();
            } finally {
                setIsLoading(false);
            }
        };
        
        checkAuthStatus();
    }, []);

    const login = async (token, refreshToken) => {
        try {
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            // decodeAndSetUser(token);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error storing auth data:', error);
        }
    };

    const logout = async () => {
        setIsAuthenticated(false);
        setUser(null);
        await clearAuthData();
    };

    return {
        isAuthenticated,
        isLoading,
        login,
        logout,
        user,
    };
}
