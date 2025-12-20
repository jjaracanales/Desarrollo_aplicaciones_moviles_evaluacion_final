import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { Task, apiTaskToTask } from '../types/Task';
import {
    getTasks as getTasksFromApi,
    deleteTask as deleteTaskFromApi,
    toggleTaskCompletion as toggleTaskInApi,
    createTask as createTaskInApi,
    updateTask as updateTaskInApi,
    CreateTaskPayload,
    UpdateTaskPayload,
} from '../services/apiService';
import { useApiNotification } from '../context/ApiNotificationContext';

export type Filter = 'all' | 'pending' | 'completed';

interface UseTodosReturn {
    // Estados
    tasks: Task[];
    filteredTasks: Task[];
    filter: Filter;
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;

    // Estadísticas
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;

    // Acciones
    loadTasks: () => Promise<void>;
    createTask: (taskData: CreateTaskPayload) => Promise<void>;
    updateTask: (taskId: string, taskData: UpdateTaskPayload) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    toggleCompletion: (taskId: string) => Promise<void>;
    setFilter: (filter: Filter) => void;
    refreshTasks: () => Promise<void>;
}

/**
 * Custom Hook para manejar toda la lógica del Todo List
 * Encapsula las operaciones CRUD y el estado de las tareas
 * 
 * @returns Objeto con estados, estadísticas y acciones del Todo List
 * 
 * Ejemplo de uso:
 * const { tasks, isLoading, createTask, deleteTask } = useTodos();
 */
export function useTodos(): UseTodosReturn {
    // Estados principales
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [filter, setFilter] = useState<Filter>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { showNotification } = useApiNotification();

    // Estadísticas calculadas
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    /**
     * Cargar todas las tareas desde el backend
     */
    const loadTasks = useCallback(async () => {
        try {
            setError(null);
            const apiTasks = await getTasksFromApi();
            const convertedTasks = apiTasks.map(apiTaskToTask);
            setTasks(convertedTasks);
        } catch (err: any) {
            const errorMessage = err.message || 'No se pudieron cargar las tareas';
            setError(errorMessage);
            console.error('Error loading tasks:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Refrescar tareas (para pull-to-refresh)
     */
    const refreshTasks = useCallback(async () => {
        setIsRefreshing(true);
        await loadTasks();
        setIsRefreshing(false);
    }, [loadTasks]);

    /**
     * Crear una nueva tarea
     */
    const createTask = useCallback(async (taskData: CreateTaskPayload) => {
        try {
            setError(null);
            await createTaskInApi(taskData);
            showNotification('✓ Tarea creada', 'success');
            await loadTasks();
        } catch (err: any) {
            const errorMessage = err.message || 'No se pudo crear la tarea';
            setError(errorMessage);
            throw err; // Re-lanzar para que el componente pueda manejarlo
        }
    }, [loadTasks, showNotification]);

    /**
     * Actualizar una tarea existente
     */
    const updateTask = useCallback(async (taskId: string, taskData: UpdateTaskPayload) => {
        try {
            setError(null);
            await updateTaskInApi(taskId, taskData);
            showNotification('✓ Tarea actualizada', 'success');
            await loadTasks();
        } catch (err: any) {
            const errorMessage = err.message || 'No se pudo actualizar la tarea';
            setError(errorMessage);
            throw err;
        }
    }, [loadTasks, showNotification]);

    /**
     * Eliminar una tarea
     */
    const deleteTask = useCallback(async (taskId: string) => {
        try {
            setError(null);
            await deleteTaskFromApi(taskId);
            showNotification('✓ Tarea eliminada', 'success');
            await loadTasks();
        } catch (err: any) {
            const errorMessage = err.message || 'No se pudo eliminar la tarea';
            setError(errorMessage);
            throw err;
        }
    }, [loadTasks, showNotification]);

    /**
     * Cambiar estado de completado de una tarea
     */
    const toggleCompletion = useCallback(async (taskId: string) => {
        try {
            setError(null);
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            await toggleTaskInApi(taskId, !task.completed);
            await loadTasks();
        } catch (err: any) {
            const errorMessage = err.message || 'No se pudo actualizar la tarea';
            setError(errorMessage);
            throw err;
        }
    }, [tasks, loadTasks]);

    // Aplicar filtro cuando cambian las tareas o el filtro
    useEffect(() => {
        let filtered = tasks;
        if (filter === 'pending') {
            filtered = tasks.filter(task => !task.completed);
        } else if (filter === 'completed') {
            filtered = tasks.filter(task => task.completed);
        }
        setFilteredTasks(filtered);
    }, [tasks, filter]);

    // Carga inicial
    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    return {
        // Estados
        tasks,
        filteredTasks,
        filter,
        isLoading,
        isRefreshing,
        error,

        // Estadísticas
        totalTasks,
        completedTasks,
        pendingTasks,

        // Acciones
        loadTasks,
        createTask,
        updateTask,
        deleteTask,
        toggleCompletion,
        setFilter,
        refreshTasks,
    };
}
