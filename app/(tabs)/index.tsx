import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';
import { useApiNotification } from '../../context/ApiNotificationContext';
import { Task, apiTaskToTask } from '../../types/Task';
import { getTasks as getTasksFromApi, deleteTask as deleteTaskFromApi, toggleTaskCompletion as toggleTaskInApi, createTask, updateTask as updateTaskInApi, CreateTaskPayload, UpdateTaskPayload } from '../../services/apiService';
import TaskItem from '../../components/TaskItem';
import TaskForm from '../../components/TaskForm';
import EmptyState from '../../components/EmptyState';

type Filter = 'all' | 'pending' | 'completed';

export default function HomeTab() {
  const { email } = useUser();
  const { showNotification } = useApiNotification();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar tareas desde la API
  const loadTasks = useCallback(async () => {
    try {
      const apiTasks = await getTasksFromApi();
      const convertedTasks = apiTasks.map(apiTaskToTask);
      setTasks(convertedTasks);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', error.message || 'No se pudieron cargar las tareas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Aplicar filtro
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

  // Manejar pull to refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTasks();
    setIsRefreshing(false);
  };

  // Manejar guardar/actualizar tarea
  const handleSaveTask = async (taskData: CreateTaskPayload | UpdateTaskPayload, taskId?: string) => {
    try {
      if (editingTask && taskId) {
        // Actualizar tarea existente
        await updateTaskInApi(taskId, taskData as UpdateTaskPayload);
        setEditingTask(null);
      } else {
        // Agregar nueva tarea
        await createTask(taskData as CreateTaskPayload);
        showNotification('✓ Tarea creada', 'success');
      }

      await loadTasks();
      setIsFormVisible(false);
    } catch (error: any) {
      console.error('[index.tsx] Error saving task:', error);
      console.error('[index.tsx] Error stack:', error.stack);
      Alert.alert('Error', error.message || 'No se pudo guardar la tarea');
    }
  };

  // Manejar edición de tarea
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormVisible(true);
  };

  // Manejar eliminación de tarea
  const handleDeleteTask = async (taskId: string) => {
    try {
      Alert.alert(
        'Eliminar tarea',
        '¿Estás seguro de que deseas eliminar esta tarea?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              await deleteTaskFromApi(taskId);
              showNotification('✓ Tarea eliminada', 'success');
              await loadTasks();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', error.message || 'No se pudo eliminar la tarea');
    }
  };

  // Manejar cambio de estado de tarea
  const handleToggleCompletion = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      await toggleTaskInApi(taskId, !task.completed);
      await loadTasks();
    } catch (error: any) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', error.message || 'No se pudo actualizar la tarea');
    }
  };

  // Estadísticas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const renderFilterButton = (filterType: Filter, label: string, icon: string) => {
    const isActive = filter === filterType;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setFilter(filterType)}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={icon as any}
          size={18}
          color={isActive ? '#fff' : '#059669'}
        />
        <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <MaterialIcons name="hourglass-empty" size={48} color="#10B981" />
          <Text style={styles.loadingText}>Cargando tareas...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background gradient */}
      <View style={styles.background}>
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />
      </View>

      {/* Header Stats */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Tareas</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalTasks}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{pendingTasks}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {renderFilterButton('all', 'Todas', 'view-list')}
        {renderFilterButton('pending', 'Pendientes', 'schedule')}
        {renderFilterButton('completed', 'Completadas', 'check-circle')}
      </View>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggleComplete={handleToggleCompletion}
              onEdit={handleEdit}
              onDelete={handleDeleteTask}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#10B981"
              colors={['#10B981']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingTask(null);
          setIsFormVisible(true);
        }}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Task Form Modal */}
      <TaskForm
        visible={isFormVisible}
        userEmail={email}
        editingTask={editingTask}
        onClose={() => {
          setIsFormVisible(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0E1A',
  },
  gradientCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#1E3A8A',
    top: -100,
    right: -100,
    opacity: 0.3,
  },
  gradientCircle2: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#3B82F6',
    bottom: -80,
    left: -60,
    opacity: 0.2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: 'rgba(59, 130, 246, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
    marginTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
});
