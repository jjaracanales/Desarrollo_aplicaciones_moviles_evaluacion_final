import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'https://todo-list.dobleb.cl';
const TOKEN_KEY = '@todolist_token';

// Tipos
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      createdAt: string;
      updatedAt: string;
    };
    token: string;
  };
}

export interface ApiTask {
  id: string;
  title: string;
  completed: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  image?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTasksResponse {
  success: boolean;
  data: ApiTask[];
  count: number;
}

export interface ApiTaskResponse {
  success: boolean;
  data: ApiTask;
}

export interface CreateTaskPayload {
  title: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  image?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  completed?: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  image?: string;
}

// Gestión de tokens
export async function saveToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

export async function removeToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
    throw error;
  }
}

// Manejo de errores de API
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = { success: false, error: 'Error al procesar respuesta del servidor' };
  }

  if (!response.ok || data.success === false) {
    // Extraer mensaje de error de varios formatos posibles
    let errorMessage = 'Error desconocido';

    if (typeof data.error === 'string') {
      errorMessage = data.error;
    } else if (typeof data.message === 'string') {
      errorMessage = data.message;
    } else if (data.error && typeof data.error === 'object') {
      errorMessage = JSON.stringify(data.error);
    }

    // Manejar códigos de estado específicos
    if (response.status === 401) {
      // Verificar si es un error de login o token expirado
      const isLoginError = !await getToken();
      if (isLoginError) {
        // Es un intento de login fallido, mostrar el error real
        throw new ApiError(401, errorMessage || 'Email o contraseña incorrectos');
      } else {
        // Token expirado durante una solicitud
        await removeToken();
        throw new ApiError(401, 'Sesión expirada. Por favor inicia sesión nuevamente.');
      }
    } else if (response.status === 400) {
      throw new ApiError(400, errorMessage || 'Datos inválidos');
    } else if (response.status === 404) {
      throw new ApiError(404, errorMessage || 'Recurso no encontrado');
    } else if (response.status === 500) {
      throw new ApiError(500, errorMessage || 'Error del servidor. Intenta nuevamente más tarde.');
    }

    throw new ApiError(response.status, errorMessage);
  }

  return data;
}

// API de Autenticación
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await handleResponse<AuthResponse>(response);

    // Guardar token
    if (data.success && data.data.token) {
      await saveToken(data.data.token);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Login error:', error);
    throw new Error('Error de conexión. Verifica tu internet.');
  }
}

export async function register(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await handleResponse<AuthResponse>(response);

    // Guardar token
    if (data.success && data.data.token) {
      await saveToken(data.data.token);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Register error:', error);
    throw new Error('Error de conexión. Verifica tu internet.');
  }
}

// API de Tareas
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getToken();
  if (!token) {
    throw new ApiError(401, 'No hay sesión activa');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export async function getTasks(): Promise<ApiTask[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/todos`, {
      method: 'GET',
      headers,
    });

    const result = await handleResponse<ApiTasksResponse>(response);
    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Get tasks error:', error);
    throw new Error('Error al cargar las tareas');
  }
}

export async function getTask(id: string): Promise<ApiTask> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: 'GET',
      headers,
    });

    const result = await handleResponse<ApiTaskResponse>(response);
    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Get task error:', error);
    throw new Error('Error al cargar la tarea');
  }
}

export async function createTask(payload: CreateTaskPayload): Promise<ApiTask> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const result = await handleResponse<ApiTaskResponse>(response);
    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Error al crear la tarea');
  }
}

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<ApiTask> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });

    const result = await handleResponse<ApiTaskResponse>(response);
    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Update task error:', error);
    throw new Error('Error al actualizar la tarea');
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: 'DELETE',
      headers,
    });

    await handleResponse<ApiTaskResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Delete task error:', error);
    throw new Error('Error al eliminar la tarea');
  }
}

export async function toggleTaskCompletion(id: string, completed: boolean): Promise<ApiTask> {
  return updateTask(id, { completed });
}

// Subir imagen usando multipart/form-data
export async function uploadImage(imageUri: string): Promise<string> {
  try {
    const token = await getToken();
    if (!token) {
      throw new ApiError(401, 'No hay sesión activa');
    }

    // Crear form data
    const formData = new FormData();

    // Extraer nombre de archivo desde URI
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Agregar archivo de imagen
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    const response = await fetch(`${API_URL}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await handleResponse<{ success: boolean; data: { url: string; key: string; size: number; contentType: string } }>(response);
    return result.data.url;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Upload image error:', error);
    throw new Error('Error al subir la imagen');
  }
}
