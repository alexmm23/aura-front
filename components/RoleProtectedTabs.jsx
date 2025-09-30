import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { View, Text, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';

const RoleProtectedTabs = ({ children, requiredRole }) => {
    const { user, isAuthenticated, isLoading, hasRole, getHomeRoute } = useAuth();
    const router = useRouter();
    const [hasRedirected, setHasRedirected] = useState(false);

    useEffect(() => {
        if (isLoading || hasRedirected) return;

        if (!isAuthenticated || !user) {
            console.log('Not authenticated, redirecting to login');
            setHasRedirected(true);
            router.replace('/(auth)/login');
            return;
        }

        // Verificar si el usuario tiene el rol requerido
        if (requiredRole && !hasRole(requiredRole)) {
            console.log(`User does not have required role ${requiredRole}, redirecting to appropriate home`);
            setHasRedirected(true);
            const homeRoute = getHomeRoute();
            router.replace(homeRoute);
            return;
        }

        console.log(`User has required role ${requiredRole}, allowing access`);
    }, [isAuthenticated, isLoading, user, requiredRole, hasRedirected]);

    // Mostrar loading mientras se verifica
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
                    Verificando permisos...
                </Text>
            </View>
        );
    }

    // Si no está autenticado o no tiene el rol, no renderizar
    if (!isAuthenticated || !user || (requiredRole && !hasRole(requiredRole))) {
        return null;
    }

    return children;
};

export default RoleProtectedTabs;