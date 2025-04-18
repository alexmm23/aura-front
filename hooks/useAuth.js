import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if the user is authenticated on component mount
        const checkAuthStatus = async () => {
            try {
                // Check if token exists in AsyncStorage
                const token = await AsyncStorage.getItem('userToken');
                const userData = await AsyncStorage.getItem('userData');

                if (token) {
                    setIsAuthenticated(true);
                    setUser(userData ? JSON.parse(userData) : null);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
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

    const login = async (token, userData) => {
        try {
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            setIsAuthenticated(true);
            setUser(userData);
        } catch (error) {
            console.error('Error storing auth data:', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Error removing auth data:', error);
        }
    };

    return {
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
    };
}