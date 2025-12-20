import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useApiNotification } from '../context/ApiNotificationContext';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'https://todo-list.dobleb.cl';

export default function BackendStatusBadge() {
    const [isConnected, setIsConnected] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const pulseAnim = new Animated.Value(1);
    const slideAnim = new Animated.Value(-100);
    const { currentNotification } = useApiNotification();

    useEffect(() => {
        checkBackendConnection();
        const interval = setInterval(checkBackendConnection, 30000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Animación de pulso para el indicador
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        // Animación de deslizamiento cuando hay notificación
        if (currentNotification) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [currentNotification]);

    const checkBackendConnection = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${API_URL}/health`, {
                method: 'GET',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            setIsConnected(response.ok);
        } catch (error) {
            setIsConnected(false);
        } finally {
            setIsChecking(false);
        }
    };

    if (isChecking) {
        return null;
    }

    const getNotificationIcon = () => {
        if (!currentNotification) return null;

        switch (currentNotification.type) {
            case 'success':
                return 'check-circle';
            case 'error':
                return 'error';
            case 'info':
                return 'info';
            default:
                return 'info';
        }
    };

    const getNotificationColor = () => {
        if (!currentNotification) return '#10B981';

        switch (currentNotification.type) {
            case 'success':
                return '#10B981';
            case 'error':
                return '#DC2626';
            case 'info':
                return '#3B82F6';
            default:
                return '#10B981';
        }
    };

    return (
        <View style={styles.container}>
            {/* Badge de conexión */}
            <Animated.View
                style={[
                    styles.badge,
                    isConnected ? styles.badgeConnected : styles.badgeDisconnected,
                    { transform: [{ scale: pulseAnim }] }
                ]}
            >
                <MaterialIcons
                    name={isConnected ? 'cloud-done' : 'cloud-off'}
                    size={16}
                    color="#fff"
                />
            </Animated.View>

            {/* Barra de estado base */}
            <View style={[styles.statusBar, isConnected ? styles.statusBarConnected : styles.statusBarDisconnected]}>
                <Text style={styles.statusText}>
                    {isConnected ? '● Conectado' : '● Desconectado'}
                </Text>
                <Text style={styles.urlText}>{API_URL.replace('https://', '')}</Text>
            </View>

            {/* Notificación de operación */}
            {currentNotification && (
                <Animated.View
                    style={[
                        styles.notificationBar,
                        {
                            backgroundColor: getNotificationColor(),
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <MaterialIcons
                        name={getNotificationIcon() as any}
                        size={14}
                        color="#fff"
                        style={styles.notificationIcon}
                    />
                    <Text style={styles.notificationText}>{currentNotification.message}</Text>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        right: 10,
        zIndex: 9999,
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    badge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        marginBottom: 4,
    },
    badgeConnected: {
        backgroundColor: '#10B981',
    },
    badgeDisconnected: {
        backgroundColor: '#DC2626',
    },
    statusBar: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    statusBarConnected: {
        backgroundColor: 'rgba(16, 185, 129, 0.9)',
    },
    statusBarDisconnected: {
        backgroundColor: 'rgba(220, 38, 38, 0.9)',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
    urlText: {
        fontSize: 8,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    notificationBar: {
        marginTop: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        maxWidth: 250,
    },
    notificationIcon: {
        marginRight: 6,
    },
    notificationText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
        flex: 1,
    },
});
