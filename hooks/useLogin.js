import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Platform } from 'react-native';

const STORAGE_KEY = 'aura_login_attempts'; // ✅ Clave única
const MAX_ATTEMPTS = 3;
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

    // ✅ AGREGAR: Cargar estado del bloqueo desde sessionStorage
    useEffect(() => {
        if (Platform.OS === 'web') {
            try {
                const stored = sessionStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const { attempts, blockedUntil } = JSON.parse(stored);
                    const now = Date.now();
                    
                    // Verificar si el bloqueo aún está activo
                    if (blockedUntil > now) {
                        const remaining = Math.ceil((blockedUntil - now) / 1000);
                        setFailedAttempts(attempts);
                        setIsBlocked(true);
                        setRemainingTime(remaining);
                    } else {
                        // El bloqueo expiró, limpiar
                        sessionStorage.removeItem(STORAGE_KEY);
                        setFailedAttempts(0);
                        setIsBlocked(false);
                        setRemainingTime(0);
                    }
                }
            } catch (error) {
                console.error('Error reading from sessionStorage:', error);
            }
        }
    }, []);

    // Limpiar timer al desmontar el componente
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Manejar el countdown cuando está bloqueado
    useEffect(() => {
        if (isBlocked && remainingTime > 0) {
            timerRef.current = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev <= 1) {
                        setIsBlocked(false);
                        setFailedAttempts(0);
                        
                        // ✅ LIMPIAR sessionStorage al desbloquear
                        if (Platform.OS === 'web') {
                            try {
                                sessionStorage.removeItem(STORAGE_KEY);
                            } catch (error) {
                                console.error('Error removing from sessionStorage:', error);
                            }
                        }
                        
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isBlocked, remainingTime]);

    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
        // Limpiar error del campo cuando el usuario empieza a escribir
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

    // ✅ AGREGAR: Función para guardar intentos en sessionStorage
    const saveAttemptsToStorage = (attempts, blocked) => {
        if (Platform.OS !== 'web') return;

        try {
            if (blocked) {
                const blockedUntil = Date.now() + (BLOCK_DURATION * 1000);
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                    attempts,
                    blockedUntil,
                }));
            } else {
                sessionStorage.removeItem(STORAGE_KEY);
            }
        } catch (error) {
            console.error('Error saving to sessionStorage:', error);
        }
    };

    const handleSubmit = async () => {
        // Verificar si está bloqueado
        if (isBlocked) {
            setErrors({ 
                form: `Demasiados intentos fallidos. Intenta de nuevo en ${remainingTime} segundos.` 
            });
            return;
        }

        // Prevenir múltiples envíos
        if (isSubmitting) return;

        // Limpiar errores previos
        setErrors({});

        // Validación
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
                console.log('Login successful! AuthContext will handle redirection automatically');
                // ✅ Resetear intentos en caso de éxito
                setFailedAttempts(0);
                setIsBlocked(false);
                setRemainingTime(0);
                saveAttemptsToStorage(0, false);
                // El AuthContext se encarga de la redirección
            } else {
                // ✅ Incrementar intentos fallidos
                const newFailedAttempts = failedAttempts + 1;
                setFailedAttempts(newFailedAttempts);

                const errorMessage = result?.message || 'Error desconocido en el login';
                console.error('Login failed:', errorMessage);

                // Verificar si se alcanzaron 3 intentos
                if (newFailedAttempts >= MAX_ATTEMPTS) {
                    setIsBlocked(true);
                    setRemainingTime(BLOCK_DURATION);
                    saveAttemptsToStorage(newFailedAttempts, true); // ✅ Guardar bloqueo
                    setErrors({ 
                        form: 'Demasiados intentos fallidos. El inicio de sesión ha sido bloqueado por 1 minuto.' 
                    });
                } else {
                    saveAttemptsToStorage(newFailedAttempts, false); // ✅ Guardar intentos
                    setErrors({ 
                        form: `${errorMessage}. Intentos restantes: ${MAX_ATTEMPTS - newFailedAttempts}` 
                    });
                }
                
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Login error in component:', error);
            
            // ✅ Incrementar intentos fallidos también en caso de error
            const newFailedAttempts = failedAttempts + 1;
            setFailedAttempts(newFailedAttempts);

            if (newFailedAttempts >= MAX_ATTEMPTS) {
                setIsBlocked(true);
                setRemainingTime(BLOCK_DURATION);
                saveAttemptsToStorage(newFailedAttempts, true); // ✅ Guardar bloqueo
                setErrors({
                    form: 'Demasiados intentos fallidos. El inicio de sesión ha sido bloqueado por 1 minuto.',
                });
            } else {
                saveAttemptsToStorage(newFailedAttempts, false); // ✅ Guardar intentos
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