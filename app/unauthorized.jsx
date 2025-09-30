import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function Unauthorized() {
    const router = useRouter();
    const { logout, getHomeRoute } = useAuth();

    const handleGoHome = () => {
        const homeRoute = getHomeRoute();
        router.replace(homeRoute);
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Ionicons 
                    name="lock-closed" 
                    size={80} 
                    color={Colors.light.error} 
                    style={styles.icon}
                />
                
                <Text style={styles.title}>Acceso Denegado</Text>
                <Text style={styles.message}>
                    No tienes permisos para acceder a esta sección.
                </Text>
                
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.button, styles.primaryButton]} 
                        onPress={handleGoHome}
                    >
                        <Ionicons name="home" size={20} color="white" />
                        <Text style={styles.primaryButtonText}>Ir al Inicio</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.button, styles.secondaryButton]} 
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out" size={20} color={Colors.light.primary} />
                        <Text style={styles.secondaryButtonText}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: 15,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        gap: 8,
    },
    primaryButton: {
        backgroundColor: Colors.light.primary,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.light.primary,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButtonText: {
        color: Colors.light.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});