import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function EmptyState() {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <MaterialIcons name="assignment-turned-in" size={80} color="rgba(59, 130, 246, 0.3)" />
            </View>
            <Text style={styles.title}>No hay tareas aún</Text>
            <Text style={styles.subtitle}>
                Toca el botón + para crear tu primera tarea
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#60A5FA',
        textAlign: 'center',
    },
});
