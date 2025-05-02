import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Verifica si el token ha expirado
    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
            return decoded.exp < currentTime; // Retorna true si el token ha expirado
        } catch (error) {
            return true; // Si no se puede decodificar, considera el token como expirado
        }
    };

    // Solicita un nuevo access token usando el refresh token
    const refreshAccessToken = async (refreshToken) => {
        try {
            const response = await fetch('http://localhost:3000/api/users/token/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                throw new Error('No se pudo renovar el token');
            }

            const data = await response.json();
            return data.accessToken;
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

                if (token && !isTokenExpired(token)) {
                    // Si el access token es válido
                    setIsAuthenticated(true);
                } else if (refreshToken) {
                    // Si el access token ha expirado, intenta renovarlo
                    const newAccessToken = await refreshAccessToken(refreshToken);
                    if (newAccessToken) {
                        await AsyncStorage.setItem('userToken', newAccessToken);
                        setIsAuthenticated(true);
                    } else {
                        // Si no se puede renovar el token, cerrar sesión
                        setIsAuthenticated(false);
                    }
                } else {
                    // Si no hay tokens, el usuario no está autenticado
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
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
