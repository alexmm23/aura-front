import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useLogin=() => {
    const { login }=useAuth();
    const [formData, setFormData]=useState({
        email: '',
        password: '',
    });
    const [errors, setErrors]=useState({});
    const [showPassword, setShowPassword]=useState(false);
    const [isSubmitting, setIsSubmitting]=useState(false);

    const handleChange=(field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
        // Limpiar error del campo cuando el usuario empieza a escribir
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    const validateForm=() => {
        const newErrors={};

        if (!formData.email.trim()) {
            newErrors.email='El correo electrónico es obligatorio';
        } else {
            const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                newErrors.email='Por favor ingresa un email válido';
            }
        }

        if (!formData.password.trim()) {
            newErrors.password='La contraseña es obligatoria';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length===0;
    };

    const handleSubmit=async () => {
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

            const credentials={
                email: formData.email.trim(),
                password: formData.password,
            };

            const result=await login(credentials);

            console.log('Login result received:', result);

            if (result&&result.success) {
                console.log('Login successful! AuthContext will handle redirection automatically');
                // El AuthContext se encarga de la redirección
            } else {
                const errorMessage=result?.message||'Error desconocido en el login';
                console.error('Login failed:', errorMessage);
                setErrors({ form: errorMessage });
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Login error in component:', error);
            setErrors({
                form: error.message||'Error de conexión. Verifica tu internet.',
            });
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility=() => {
        setShowPassword(!showPassword);
    };

    return {
        formData,
        errors,
        showPassword,
        isSubmitting,
        handleChange,
        handleSubmit,
        togglePasswordVisibility,
    };
};
