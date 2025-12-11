import * as Location from 'expo-location';
import { Location as LocationType } from '../types/Task';

/**
 * Request location permissions
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
 * Get current location
 */
export async function getCurrentLocation(): Promise<LocationType | null> {
    try {
        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
            console.log('Location permission not granted');
            return null;
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        // Optional: Get address from coordinates
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
        console.error('Error getting location:', error);
        return null;
    }
}
