import * as Legacy from 'expo-file-system/legacy';

const PHOTOS_DIR = `${Legacy.documentDirectory}task_photos/`;

/**
 * Ensure the photos directory exists
 */
async function ensurePhotosDirectory(): Promise<void> {
    const dirInfo = await Legacy.getInfoAsync(PHOTOS_DIR);
    if (!dirInfo.exists) {
        await Legacy.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
    }
}

/**
 * Save a photo to the file system
 * @param uri - URI of the photo from image picker
 * @param taskId - ID of the task
 * @returns The local file URI
 */
export async function savePhoto(uri: string, taskId: string): Promise<string> {
    try {
        await ensurePhotosDirectory();

        const fileName = `${taskId}.jpg`;
        const destination = `${PHOTOS_DIR}${fileName}`;

        await Legacy.copyAsync({
            from: uri,
            to: destination,
        });

        return destination;
    } catch (error) {
        console.error('Error saving photo:', error);
        throw error;
    }
}

/**
 * Delete a photo from the file system
 */
export async function deletePhoto(taskId: string): Promise<void> {
    try {
        const fileName = `${taskId}.jpg`;
        const filePath = `${PHOTOS_DIR}${fileName}`;

        const fileInfo = await Legacy.getInfoAsync(filePath);
        if (fileInfo.exists) {
            await Legacy.deleteAsync(filePath);
        }
    } catch (error) {
        console.error('Error deleting photo:', error);
        // Don't throw - it's okay if photo deletion fails
    }
}

/**
 * Get the URI of a saved photo
 */
export function getPhotoUri(taskId: string): string {
    return `${PHOTOS_DIR}${taskId}.jpg`;
}
