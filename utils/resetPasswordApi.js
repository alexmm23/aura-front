// Funciones API específicas para el reset de contraseña
// Estas funciones parsean automáticamente el JSON y devuelven el formato {ok, data}

import { buildApiUrl } from '../config/api';

/**
 * Función para hacer fetch directo con parsing automático de JSON
 * Solo para endpoints que NO requieren autenticación (como reset password)
 */
const fetchAndParseJson = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        
        return {
            ok: response.ok,
            status: response.status,
            data: data
        };
    } catch (error) {
        return {
            ok: false,
            status: 500,
            data: { error: error.message }
        };
    }
};

/**
 * GET específico para verificar token de reset (sin autenticación)
 */
export const apiGetResetToken = async (endpoint) => {
    const url = buildApiUrl(endpoint);
    return fetchAndParseJson(url, {
        method: 'GET'
    });
};

/**
 * POST específico para confirmar reset de contraseña (sin autenticación)
 */
export const apiPostResetPassword = async (endpoint, data) => {
    const url = buildApiUrl(endpoint);
    return fetchAndParseJson(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

/**
 * POST específico para solicitar reset de contraseña (sin autenticación)  
 */
export const apiPostForgotPassword = async (endpoint, data) => {
    const url = buildApiUrl(endpoint);
    return fetchAndParseJson(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
};