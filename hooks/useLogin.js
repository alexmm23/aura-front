import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'aura_login_attempts';
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 60; // 60 segundos

export const useLogin = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados para el bloqueo
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const timerRef = useRef(null);
    const appState = useRef(AppState.currentState);

    // ✅ Función para obtener/guardar en storage según plataforma
    const getStorageData = async () => {
        try {
            if (Platform.OS === 'web') {
                const stored = sessionStorage.getItem(STORAGE_KEY);
                return stored ? JSON.parse(stored) : null;
            } else {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                return stored ? JSON.parse(stored) : null;
            }
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    };

    const setStorageData = async (data) => {
        try {
            if (Platform.OS === 'web') {
                if (data) {
                    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                } else {
                    sessionStorage.removeItem(STORAGE_KEY);
                }
            } else {
                if (data) {
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                } else {
                    await AsyncStorage.removeItem(STORAGE_KEY);
                }
            }
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    };

    // ✅ Función para calcular el tiempo restante basado en timestamp
    const calculateRemainingTime = (blockedUntil) => {
        const now = Date.now();
        if (blockedUntil > now) {
            return Math.ceil((blockedUntil - now) / 1000);
        }
        return 0;
    };

    // ✅ Función para actualizar el estado del bloqueo
    const updateBlockStatus = async () => {
        const stored = await getStorageData();
        if (stored && stored.blockedUntil) {
            const remaining = calculateRemainingTime(stored.blockedUntil);
            
            if (remaining > 0) {
                setFailedAttempts(stored.attempts || 0);
                setIsBlocked(true);
                setRemainingTime(remaining);
                return true;
            } else {
                // El bloqueo expiró
                await setStorageData(null);
                setFailedAttempts(0);
                setIsBlocked(false);
                setRemainingTime(0);
                return false;
            }
        }
        return false;
    };

    // ✅ Cargar estado inicial
    useEffect(() => {
        updateBlockStatus();
    }, []);

    // ✅ Detectar cuando la app vuelve del segundo plano (solo móvil)
    useEffect(() => {
        if (Platform.OS !== 'web') {
            const subscription = AppState.addEventListener('change', async (nextAppState) => {
                if (
                    appState.current.match(/inactive|background/) &&
                    nextAppState === 'active'
                ) {
                    // La app volvió al foreground, actualizar el estado
                    await updateBlockStatus();
                }
                appState.current = nextAppState;
            });

            return () => {
                subscription?.remove();
            };
        }
    }, []);

    // ✅ Timer para actualizar el countdown cada segundo
    useEffect(() => {
        if (isBlocked && remainingTime > 0) {
            timerRef.current = setInterval(async () => {
                const stored = await getStorageData();
                if (stored && stored.blockedUntil) {
                    const remaining = calculateRemainingTime(stored.blockedUntil);
                    
                    if (remaining > 0) {
                        setRemainingTime(remaining);
                    } else {
                        // Tiempo agotado
                        setIsBlocked(false);
                        setFailedAttempts(0);
                        setRemainingTime(0);
                        await setStorageData(null);
                        clearInterval(timerRef.current);
                    }
                }
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isBlocked, remainingTime]);

    // Limpiar timer al desmontar
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'El correo electrónico es obligatorio';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                newErrors.email = 'Por favor ingresa un email válido';
            }
        }

        if (!formData.password.trim()) {
            newErrors.password = 'La contraseña es obligatoria';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        // ✅ Verificar estado actual antes de continuar
        const stillBlocked = await updateBlockStatus();
        
        if (stillBlocked || isBlocked) {
            setErrors({ 
                form: `Demasiados intentos fallidos. Intenta de nuevo en ${remainingTime} segundos.` 
            });
            return;
        }

        if (isSubmitting) return;

        setErrors({});

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('Attempting login with:', {
                email: formData.email.trim(),
                hasPassword: !!formData.password,
            });

            const credentials = {
                email: formData.email.trim(),
                password: formData.password,
            };

            const result = await login(credentials);

            console.log('Login result received:', result);

            if (result && result.success) {
                console.log('Login successful!');
                // ✅ Resetear intentos en caso de éxito
                setFailedAttempts(0);
                setIsBlocked(false);
                setRemainingTime(0);
                await setStorageData(null);
            } else {
                // ✅ Incrementar intentos fallidos
                const newFailedAttempts = failedAttempts + 1;
                setFailedAttempts(newFailedAttempts);

                // 🔒 IMPORTANTE: El mensaje de error puede venir del servidor
                // Si el servidor responde con un bloqueo, respetarlo
                const errorMessage = result?.message || 'Credenciales incorrectas';
                
                // ✅ Verificar si el servidor indica un bloqueo
                if (result?.blocked) {
                    // El servidor indica que la cuenta está bloqueada
                    const serverBlockTime = result?.blockDuration || BLOCK_DURATION;
                    const blockedUntil = Date.now() + (serverBlockTime * 1000);
                    
                    setIsBlocked(true);
                    setRemainingTime(serverBlockTime);
                    
                    await setStorageData({
                        attempts: MAX_ATTEMPTS,
                        blockedUntil: blockedUntil,
                    });
                    
                    setErrors({ 
                        form: result?.message || 'Cuenta bloqueada temporalmente por seguridad.' 
                    });
                } else if (newFailedAttempts >= MAX_ATTEMPTS) {
                    // Bloqueo local del frontend
                    const blockedUntil = Date.now() + (BLOCK_DURATION * 1000);
                    setIsBlocked(true);
                    setRemainingTime(BLOCK_DURATION);
                    
                    await setStorageData({
                        attempts: newFailedAttempts,
                        blockedUntil: blockedUntil,
                    });
                    
                    setErrors({ 
                        form: 'Demasiados intentos fallidos. El inicio de sesión ha sido bloqueado por 1 minuto.' 
                    });
                } else {
                    await setStorageData({
                        attempts: newFailedAttempts,
                        blockedUntil: null,
                    });
                    
                    setErrors({ 
                        form: `${errorMessage}. Intentos restantes: ${MAX_ATTEMPTS - newFailedAttempts}` 
                    });
                }
                
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Login error in component:', error);
            
            const newFailedAttempts = failedAttempts + 1;
            setFailedAttempts(newFailedAttempts);

            if (newFailedAttempts >= MAX_ATTEMPTS) {
                const blockedUntil = Date.now() + (BLOCK_DURATION * 1000);
                setIsBlocked(true);
                setRemainingTime(BLOCK_DURATION);
                
                await setStorageData({
                    attempts: newFailedAttempts,
                    blockedUntil: blockedUntil,
                });
                
                setErrors({
                    form: 'Demasiados intentos fallidos. El inicio de sesión ha sido bloqueado por 1 minuto.',
                });
            } else {
                await setStorageData({
                    attempts: newFailedAttempts,
                    blockedUntil: null,
                });
                
                setErrors({
                    form: `${error.message || 'Error de conexión. Verifica tu internet.'}. Intentos restantes: ${MAX_ATTEMPTS - newFailedAttempts}`,
                });
            }
            
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return {
        formData,
        errors,
        showPassword,
        isSubmitting,
        isBlocked,
        remainingTime,
        failedAttempts,
        handleChange,
        handleSubmit,
        togglePasswordVisibility,
    };
};