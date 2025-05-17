import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const isTokenExpired = async (token) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/token/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            if (!response.ok) {
                throw new Error('Token inválido o expirado');
            }
            const data = await response.json();
            return data.expired;
        } catch (error) {
            console.error('Error al verificar el token:', error);
            return true; // Si hay un error, consideramos que el token ha expirado
        }
    };

    // Solicita un nuevo access token usando el refresh token
    const refreshAccessToken = async (refreshToken) => {
        try {
            const body = {
                refreshToken,
            };
            // console.log('Cuerpo de la solicitud para renovar el token:', body);
            const response = await fetch('http://localhost:3000/api/auth/token/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al renovar el token:', error);
            return null;
        }
    };

    // Verifica el estado de autenticación al montar el componente
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                const tokenExpired = await isTokenExpired(token);
                if (token && !tokenExpired) {
                    +
                    setIsAuthenticated(true); // Usuario autenticado
                } else if (refreshToken) {
                    const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken);
                    if (accessToken && newRefreshToken) {
                        const newAccessToken = accessToken;
                        await AsyncStorage.setItem('userToken', newAccessToken);
                        await AsyncStorage.setItem('refreshToken', newRefreshToken);
                        console.log('Token renovado:', newAccessToken);
                        setIsAuthenticated(true); // Usuario autenticado
                    } else {
                        setIsAuthenticated(false); // No se pudo renovar el token
                    }
                } else {
                    setIsAuthenticated(false); // No hay tokens válidos
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false); // Finaliza la carga
            }
        };

        checkAuthStatus();
    }, []);

    // Maneja el inicio de sesión
    const login = async (token, refreshToken) => {
        try {
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error storing auth data:', error);
        }
    };

    // Maneja el cierre de sesión
    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('refreshToken');
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error removing auth data:', error);
        }
    };

    return {
        isAuthenticated,
        isLoading,
        login,
        logout,
    };
}
