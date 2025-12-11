import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/Task';

const TASKS_KEY = '@todolist_tasks';

/**
 * DEPRECATED: Este archivo ya no se usa. Todas las tareas se manejan en el backend.
 * Se mantiene solo para referencia.
 */

/**
 * Get all tasks for a specific user
 */
export async function getTasks(userEmail: string): Promise<Task[]> {
    try {
        const tasksJson = await AsyncStorage.getItem(TASKS_KEY);
        if (!tasksJson) return [];

        const allTasks: Task[] = JSON.parse(tasksJson);
        // Filter tasks by user id
        return allTasks.filter(task => task.userId === userEmail);
    } catch (error) {
        console.error('Error getting tasks:', error);
        return [];
    }
}

/**
 * Save all tasks to AsyncStorage
 */
export async function saveTasks(tasks: Task[]): Promise<void> {
    try {
        // Get existing tasks
        const existingTasksJson = await AsyncStorage.getItem(TASKS_KEY);
        const existingTasks: Task[] = existingTasksJson ? JSON.parse(existingTasksJson) : [];

        // Get unique user ids from new tasks
        const newUserIds = [...new Set(tasks.map(t => t.userId))];

        // Remove tasks from other users that are in the new tasks list
        const otherUsersTasks = existingTasks.filter(
            task => !newUserIds.includes(task.userId)
        );

        // Combine and save
        const allTasks = [...otherUsersTasks, ...tasks];
        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
    } catch (error) {
        console.error('Error saving tasks:', error);
        throw error;
    }
}

/**
 * Add a new task
 */
export async function addTask(task: Task): Promise<void> {
    try {
        const existingTasksJson = await AsyncStorage.getItem(TASKS_KEY);
        const existingTasks: Task[] = existingTasksJson ? JSON.parse(existingTasksJson) : [];

        const updatedTasks = [task, ...existingTasks];
        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
        console.error('Error adding task:', error);
        throw error;
    }
}

/**
 * Delete a task by ID
 */
export async function deleteTask(taskId: string): Promise<void> {
    try {
        const existingTasksJson = await AsyncStorage.getItem(TASKS_KEY);
        if (!existingTasksJson) return;

        const existingTasks: Task[] = JSON.parse(existingTasksJson);
        const updatedTasks = existingTasks.filter(task => task.id !== taskId);

        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
}

/**
 * Update an existing task
 */
export async function updateTask(updatedTask: Task): Promise<void> {
    try {
        const existingTasksJson = await AsyncStorage.getItem(TASKS_KEY);
        if (!existingTasksJson) return;

        const existingTasks: Task[] = JSON.parse(existingTasksJson);
        const updatedTasks = existingTasks.map(task =>
            task.id === updatedTask.id ? updatedTask : task
        );

        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
}

/**
 * Toggle task completion status
 */
export async function toggleTaskCompletion(taskId: string): Promise<void> {
    try {
        const existingTasksJson = await AsyncStorage.getItem(TASKS_KEY);
        if (!existingTasksJson) return;

        const existingTasks: Task[] = JSON.parse(existingTasksJson);
        const updatedTasks = existingTasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );

        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
        console.error('Error toggling task completion:', error);
        throw error;
    }
}
