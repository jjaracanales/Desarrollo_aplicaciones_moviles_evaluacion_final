import * as Location from 'expo-location';
import { Location as LocationType } from '../types/Task';

/**
 * Solicitar permisos de ubicación
 */
export async function requestLocationPermission(): Promise<boolean> {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error requesting location permission:', error);
        return false;
    }
}

/**
 * Obtener ubicación actual
 * Retorna null silenciosamente si la ubicación no está disponible - esto es comportamiento esperado
 */
export async function getCurrentLocation(): Promise<LocationType | null> {
    try {
        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
            console.log('Location permission not granted - continuing without location');
            return null;
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        // Opcional: Obtener dirección desde coordenadas
        let address: string | undefined;
        try {
            const [reverseGeocode] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (reverseGeocode) {
                const parts = [
                    reverseGeocode.street,
                    reverseGeocode.city,
                    reverseGeocode.region,
                    reverseGeocode.country,
                ].filter(Boolean);

                address = parts.join(', ');
            }
        } catch (error) {
            console.log('Could not get address from coordinates');
        }

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
    } catch (error) {
        // La ubicación es opcional, solo registramos y retornamos null
        // Esto previene mensajes de error cuando los servicios de ubicación están deshabilitados
        console.log('Location not available - task will be created without location');
        return null;
    }
}

