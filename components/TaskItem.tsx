import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Task } from '../types/Task';

interface TaskItemProps {
    task: Task;
    onToggleComplete: (taskId: string) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
}

export default function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
    const handleDelete = () => {
        onDelete(task.id);
    };

    return (
        <View style={[styles.container, task.completed && styles.completedContainer]}>
            {/* Checkbox */}
            <TouchableOpacity
                onPress={() => onToggleComplete(task.id)}
                style={styles.checkbox}
                activeOpacity={0.7}
            >
                <View style={[styles.checkboxInner, task.completed && styles.checkboxChecked]}>
                    {task.completed && (
                        <MaterialIcons name="check" size={18} color="#fff" />
                    )}
                </View>
            </TouchableOpacity>

            {/* Photo */}
            {task.image && (
                <Image
                    source={{ uri: task.image }}
                    style={styles.photo}
                    resizeMode="cover"
                />
            )}

            {/* Content */}
            <View style={styles.content}>
                <Text
                    style={[
                        styles.title,
                        task.completed && styles.completedTitle
                    ]}
                    numberOfLines={2}
                >
                    {task.title}
                </Text>

                {task.location && (
                    <View style={styles.locationContainer}>
                        <MaterialIcons name="location-on" size={14} color="#60A5FA" />
                        <Text style={styles.locationText} numberOfLines={1}>
                            {`${task.location.latitude.toFixed(4)}, ${task.location.longitude.toFixed(4)}`}
                        </Text>
                    </View>
                )}

                <Text style={styles.date}>
                    {new Date(task.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={() => onEdit(task)}
                    style={styles.editButton}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="edit" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleDelete}
                    style={styles.deleteButton}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="delete-outline" size={20} color="#DC2626" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    completedContainer: {
        opacity: 0.6,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    checkbox: {
        marginRight: 12,
        marginTop: 2,
    },
    checkboxInner: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    photo: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    completedTitle: {
        textDecorationLine: 'line-through',
        color: '#94A3B8',
    },
    comments: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 6,
        fontStyle: 'italic',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#60A5FA',
        marginLeft: 4,
        flex: 1,
    },
    date: {
        fontSize: 11,
        color: '#64748B',
    },
    actions: {
        marginLeft: 8,
        gap: 8,
    },
    editButton: {
        padding: 6,
    },
    deleteButton: {
        padding: 6,
    },
});
