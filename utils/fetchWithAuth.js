import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { buildApiUrl, API } from '../config/api';

/**
 * Wrapper para fetch que maneja automáticamente tokens y redirecciones
 * cuando el usuario no está autenticado
 * 
 * @param {string} url - URL de la API
 * @param {Object} options - Opciones de fetch
 * @returns {Promise} - Respuesta del fetch
 */
export const fetchWithAuth = async (url, options = {}) => {
    try {
        // Obtener token de autenticación
        const token = await AsyncStorage.getItem('userToken');

        // Si hay token, añadirlo a los headers
        if (token) {
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            };
        }

        // Realizar la petición
        const response = await fetch(url, options);

        // Si la respuesta es 401 (Unauthorized), intentar renovar el token
        if (response.status === 401) {
            console.log('Token expirado o inválido, intentando renovar...');

            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (!refreshToken) {
                // Si no hay refresh token, redirigir al login
                await handleLogout();
                return response;
            }

            // Intentar renovar el token
            const refreshResponse = await fetch(buildApiUrl(API.ENDPOINTS.AUTH.REFRESH_TOKEN), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!refreshResponse.ok) {
                // Si no se puede renovar, redirigir al login
                await handleLogout();
                return response;
            }

            const { accessToken: newToken, refreshToken: newRefreshToken } = await refreshResponse.json();

            // Guardar los nuevos tokens
            await AsyncStorage.setItem('userToken', newToken);
            await AsyncStorage.setItem('refreshToken', newRefreshToken);

            // Reintentar la petición original con el nuevo token
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`
            };

            return fetch(url, options);
        }

        return response;

    } catch (error) {
        console.error('Error en fetchWithAuth:', error);
        // Si hay un error no controlado, es mejor redireccionar al login
        // en lugar de permitir comportamientos inesperados
        await handleLogout();
        throw error;
    }
};

// Función auxiliar para manejar el cierre de sesión
const handleLogout = async () => {
    try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('refreshToken');

        // Redireccionar solo si estamos en un contexto de navegación
        // (evita errores si se llama en contextos donde router no está disponible)
        const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
        if (pathname.startsWith('/login')) {
            return; // Ya estamos en la página de login, no hacemos nada
        }
        if (router && router.replace) {
            router.replace('/login');
        }
    } catch (error) {
        console.error('Error al manejar el logout:', error);
    }
};

export default fetchWithAuth;
