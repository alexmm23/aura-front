import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { View, Text, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated, isLoading, hasRole } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        console.log('ProtectedRoute useEffect triggered:', { 
            isAuthenticated, 
            isLoading, 
            segments: segments.join('/'),
            userRole: user?.role_id 
        });
        
        if (isLoading) return; // Esperar a que termine la verificación de auth

        const inAuthGroup = segments[0] === '(auth)';

        if (!isAuthenticated) {
            // Si no está autenticado y no está en auth group, redirigir a login
            if (!inAuthGroup) {
                console.log('User not authenticated, redirecting to login');
                router.replace('/(auth)/login');
            } else {
                console.log('User not authenticated but already in auth group');
            }
        } else {
            // Usuario autenticado
            if (inAuthGroup) {
                // Si está autenticado pero en auth group, redirigir a home
                const homeRoute = user?.role_id === 3 ? '/(tabs_teacher)/HomeTeacher' : '/(tabs)/home';
                console.log('User authenticated, redirecting to home:', homeRoute);
                router.replace(homeRoute);
            } else if (allowedRoles.length > 0) {
                // Verificar roles si se especificaron
                const userHasPermission = allowedRoles.some(role => hasRole(role));
                
                if (!userHasPermission) {
                    console.log('User does not have required role, redirecting to unauthorized');
                    router.replace('/unauthorized');
                }
            } else {
                console.log('User authenticated and in correct section');
            }
        }
    }, [isAuthenticated, isLoading, segments, user, allowedRoles]);

    // Mostrar loading mientras se verifica la autenticación
    if (isLoading) {
        return (
            <View style={{ 
                flex: 1, 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundColor: Colors.light.background 
            }}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={{ 
                    marginTop: 10, 
                    color: Colors.light.text,
                    fontSize: 16 
                }}>
                    Verificando autenticación...
                </Text>
            </View>
        );
    }

    return children;
};

export default ProtectedRoute;