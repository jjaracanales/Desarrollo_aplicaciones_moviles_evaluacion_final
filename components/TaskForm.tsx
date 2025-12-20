import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { getCurrentLocation } from '../services/locationService';
import { Task } from '../types/Task';
import { CreateTaskPayload, UpdateTaskPayload } from '../services/apiService';

interface TaskFormProps {
    visible: boolean;
    userEmail: string;
    editingTask?: Task | null; // Optional task to edit
    onClose: () => void;
    onSave: (taskData: CreateTaskPayload | UpdateTaskPayload, taskId?: string) => void;
}

export default function TaskForm({ visible, userEmail, editingTask, onClose, onSave }: TaskFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [locationAddress, setLocationAddress] = useState<string>('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isEditMode = !!editingTask;

    // Cargar datos de tarea al editar
    useEffect(() => {
        if (visible && editingTask) {
            // Cargar datos de tarea para edición
            setTitle(editingTask.title);
            setDescription(''); // API no tiene description
            setImageUri(editingTask.image || null);
            setLatitude(editingTask.location?.latitude);
            setLongitude(editingTask.location?.longitude);
            if (editingTask.location) {
                setLocationAddress(`${editingTask.location.latitude.toFixed(6)}, ${editingTask.location.longitude.toFixed(6)}`);
            }
        } else if (visible && !editingTask) {
            // Resetear formulario para nueva tarea
            resetForm();
        }
    }, [visible, editingTask]);

    // Resetear formulario cuando el modal se cierra
    useEffect(() => {
        if (!visible) {
            resetForm();
        }
    }, [visible]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setImageUri(null);
        setLatitude(undefined);
        setLongitude(undefined);
        setLocationAddress('');
    };

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para seleccionar fotos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    const handleTakePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara para tomar fotos.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'No se pudo tomar la foto');
        }
    };

    const handleGetLocation = async () => {
        setIsLoadingLocation(true);
        try {
            const loc = await getCurrentLocation();
            if (loc) {
                setLatitude(loc.latitude);
                setLongitude(loc.longitude);
                setLocationAddress(`${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`);
                Alert.alert('Ubicación obtenida', 'Coordenadas capturadas');
            } else {
                Alert.alert('Error', 'No se pudo obtener la ubicación. Verifica los permisos.');
            }
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Error', 'No se pudo obtener la ubicación');
        } finally {
            setIsLoadingLocation(false);
        }
    };

    // Convertir imagen a base64
    const convertImageToBase64 = async (uri: string): Promise<string | null> => {
        try {
            // Si la imagen ya es de la API (https://), no la convertimos
            if (uri.startsWith('http://') || uri.startsWith('https://')) {
                return null;
            }

            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });
            return base64;
        } catch (error) {
            console.error('Error converting image to base64:', error);
            return null;
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Por favor ingresa un título para la tarea');
            return;
        }

        setIsSaving(true);
        try {

            // Upload image first if it's a new local image
            let imageUrl: string | undefined = undefined;
            if (imageUri && !imageUri.startsWith('http://') && !imageUri.startsWith('https://')) {
                // Es una imagen local, necesitamos subirla
                const { uploadImage } = await import('../services/apiService');
                imageUrl = await uploadImage(imageUri);
            } else if (imageUri) {
                // Ya es una URL de imagen subida
                imageUrl = imageUri;
            }

            // Obtener ubicación automáticamente si no está configurada
            let taskLocation: { latitude: number; longitude: number } | undefined = undefined;

            if (latitude !== undefined && longitude !== undefined) {
                taskLocation = { latitude, longitude };
            } else if (!isEditMode) {
                // Auto-captura de ubicación para tareas nuevas
                const loc = await getCurrentLocation();
                if (loc) {
                    taskLocation = { latitude: loc.latitude, longitude: loc.longitude };
                }
            }

            const taskData: CreateTaskPayload | UpdateTaskPayload = {
                title: title.trim(),
                location: taskLocation,
                image: imageUrl,
            };

            if (isEditMode && editingTask) {
                // Si está editando y la foto no cambió, no la incluir
                if (imageUrl === editingTask.image) {
                    delete (taskData as any).image;
                }
                await onSave(taskData, editingTask.id);
            } else {
                await onSave(taskData);
            }

            // Cerrar modal y resetear formulario
            onClose();
            resetForm();
        } catch (error: any) {
            console.error('Error saving task:', error);
            console.error('Error stack:', error.stack);
            Alert.alert('Error', error.message || 'No se pudo guardar la tarea');
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleCancel}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>
                                {isEditMode ? 'Editar Tarea' : 'Nueva Tarea'}
                            </Text>
                            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                                <MaterialIcons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                            {/* Title Input */}
                            <View style={styles.section}>
                                <Text style={styles.label}>Título *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: Comprar leche"
                                    placeholderTextColor="#94A3B8"
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={100}
                                />
                            </View>

                            {/* Description Input */}
                            <View style={styles.section}>
                                <Text style={styles.label}>Descripción</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Agrega notas o detalles adicionales..."
                                    placeholderTextColor="#94A3B8"
                                    value={description}
                                    onChangeText={setDescription}
                                    maxLength={500}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                                <Text style={styles.charCount}>{description.length}/500</Text>
                            </View>

                            {/* Photo Section */}
                            <View style={styles.section}>
                                <Text style={styles.label}>Foto</Text>
                                {imageUri ? (
                                    <View style={styles.photoPreviewContainer}>
                                        <Image source={{ uri: imageUri }} style={styles.photoPreview} />
                                        <TouchableOpacity
                                            style={styles.removePhotoButton}
                                            onPress={() => setImageUri(null)}
                                        >
                                            <MaterialIcons name="close" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.photoButtons}>
                                        <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                                            <MaterialIcons name="camera-alt" size={24} color="#10B981" />
                                            <Text style={styles.photoButtonText}>Cámara</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
                                            <MaterialIcons name="photo-library" size={24} color="#10B981" />
                                            <Text style={styles.photoButtonText}>Galería</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            {/* Location Section */}
                            <View style={styles.section}>
                                <Text style={styles.label}>Ubicación</Text>
                                {(latitude !== undefined && longitude !== undefined) ? (
                                    <View style={styles.locationCard}>
                                        <MaterialIcons name="location-on" size={24} color="#10B981" />
                                        <View style={styles.locationInfo}>
                                            <Text style={styles.locationAddress} numberOfLines={2}>
                                                {locationAddress || 'Ubicación capturada'}
                                            </Text>
                                            <Text style={styles.locationCoords}>
                                                {latitude.toFixed(6)}, {longitude.toFixed(6)}
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.locationButton}
                                        onPress={handleGetLocation}
                                        disabled={isLoadingLocation}
                                    >
                                        {isLoadingLocation ? (
                                            <ActivityIndicator color="#10B981" />
                                        ) : (
                                            <>
                                                <MaterialIcons name="my-location" size={20} color="#10B981" />
                                                <Text style={styles.locationButtonText}>Obtener ubicación</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>

                            {!isEditMode && (
                                <Text style={styles.helpText}>
                                    💡 La ubicación se captura automáticamente al guardar si no la has agregado manualmente
                                </Text>
                            )}
                        </ScrollView>

                        {/* Action Buttons */}
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleCancel}
                                disabled={isSaving}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, (!title.trim() || isSaving) && styles.saveButtonDisabled]}
                                onPress={handleSave}
                                disabled={!title.trim() || isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>
                                        {isEditMode ? 'Actualizar' : 'Guardar'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
    },
    closeButton: {
        padding: 4,
    },
    scrollView: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    textArea: {
        minHeight: 100,
        paddingTop: 14,
    },
    charCount: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'right',
        marginTop: 4,
    },
    photoButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    photoButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ECFDF5',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    photoButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
        marginLeft: 8,
    },
    photoPreviewContainer: {
        position: 'relative',
        width: '100%',
    },
    photoPreview: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    removePhotoButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ECFDF5',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    locationButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
        marginLeft: 8,
    },
    locationCard: {
        flexDirection: 'row',
        backgroundColor: '#ECFDF5',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    locationInfo: {
        flex: 1,
        marginLeft: 12,
    },
    locationAddress: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 4,
    },
    locationCoords: {
        fontSize: 12,
        color: '#059669',
    },
    helpText: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8,
    },
    actions: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#1E3A8A',
        shadowColor: '#10B981',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0,
        elevation: 0,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
