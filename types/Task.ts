export interface Location {
    latitude: number;
    longitude: number;
}

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    location?: Location;
    image?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

// Función auxiliar para convertir tarea de API a formato local
export function apiTaskToTask(apiTask: any): Task {
    return {
        id: apiTask.id,
        title: apiTask.title,
        completed: apiTask.completed,
        location: apiTask.location,
        image: apiTask.image,
        userId: apiTask.userId,
        createdAt: apiTask.createdAt,
        updatedAt: apiTask.updatedAt,
    };
}
