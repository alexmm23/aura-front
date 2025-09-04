import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { buildApiUrl, API, isWeb, createFetchOptions } from '../config/api';

/**
 * Wrapper universal para fetch que maneja automáticamente:
 * - Web: cookies httpOnly (credentials: 'include')
 * - Móvil: tokens JWT en headers Authorization
 * 
 * @param {string} url - URL de la API
 * @param {Object} options - Opciones de fetch
 * @returns {Promise} - Respuesta del fetch
 */
export const fetchWithAuth = async (url, options = {}) => {
    try {
        let authOptions = { ...options };

        if (isWeb()) {
            // Para web: usar cookies httpOnly automáticamente
            authOptions = createFetchOptions(authOptions);
        } else {
            // Para móvil: añadir token JWT en headers
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                authOptions.headers = {
                    'Content-Type': 'application/json',
                    ...authOptions.headers,
                    'Authorization': `Bearer ${token}`
                };
            }
        }

        // Realizar la petición
        const response = await fetch(url, authOptions);

        // Si la respuesta es 401 (Unauthorized)
        if (response.status === 401) {
            console.log('Sesión expirada o inválida...');

            if (isWeb()) {
                // En web, redirigir al login (las cookies se limpiarán automáticamente)
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            } else {
                // En móvil, intentar renovar el token
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (!refreshToken) {
                    await handleMobileLogout();
                    return response;
                }

                // Intentar renovar el token
                const refreshResponse = await fetch(buildApiUrl(API.ENDPOINTS.AUTH.REFRESH_TOKEN), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });

                if (!refreshResponse.ok) {
                    await handleMobileLogout();
                    return response;
                }

                const { accessToken: newToken, refreshToken: newRefreshToken } = await refreshResponse.json();

                // Guardar los nuevos tokens
                await AsyncStorage.setItem('userToken', newToken);
                await AsyncStorage.setItem('refreshToken', newRefreshToken);

                // Reintentar la petición original con el nuevo token
                authOptions.headers = {
                    ...authOptions.headers,
                    'Authorization': `Bearer ${newToken}`
                };

                return fetch(url, authOptions);
            }
        }

        return response;

    } catch (error) {
        console.error('Error en fetchWithAuth:', error);
        
        // En caso de error, limpiar sesión apropiadamente
        if (!isWeb()) {
            await handleMobileLogout();
        }
        
        throw error;
    }
};

// Función auxiliar para manejar el logout en móvil
const handleMobileLogout = async () => {
    try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('refreshToken');

        // Redireccionar solo si no estamos ya en login
        if (router && router.replace) {
            const currentRoute = router.pathname || '';
            if (!currentRoute.includes('/login')) {
                router.replace('/login');
            }
        }
    } catch (error) {
        console.error('Error al manejar el logout móvil:', error);
    }
};

/**
 * Función helper para hacer requests con autenticación automática
 * Usa automáticamente cookies para web y tokens para móvil
 */
export const apiRequest = async (endpoint, options = {}) => {
    const url = buildApiUrl(endpoint);
    return fetchWithAuth(url, options);
};

/**
 * Función helper para requests GET con autenticación
 */
export const apiGet = async (endpoint, options = {}) => {
    return apiRequest(endpoint, {
        method: 'GET',
        ...options
    });
};

/**
 * Función helper para requests POST con autenticación
 */
export const apiPost = async (endpoint, data = null, options = {}) => {
    const requestOptions = {
        method: 'POST',
        ...options
    };

    if (data) {
        requestOptions.body = JSON.stringify(data);
    }

    return apiRequest(endpoint, requestOptions);
};

/**
 * Función helper para requests PUT con autenticación
 */
export const apiPut = async (endpoint, data = null, options = {}) => {
    const requestOptions = {
        method: 'PUT',
        ...options
    };

    if (data) {
        requestOptions.body = JSON.stringify(data);
    }

    return apiRequest(endpoint, requestOptions);
};

/**
 * Función helper para requests DELETE con autenticación
 */
export const apiDelete = async (endpoint, options = {}) => {
    return apiRequest(endpoint, {
        method: 'DELETE',
        ...options
    });
};

export const apiPatch = async (endpoint, data = null, options = {}) => {
    const requestOptions = {
        method: 'PATCH',
        ...options
    };

    if (data) {
        requestOptions.body = JSON.stringify(data);
    }

    return apiRequest(endpoint, requestOptions);
};

export default fetchWithAuth;
