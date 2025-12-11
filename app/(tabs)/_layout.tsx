import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: '#0F172A',
          borderBottomColor: 'rgba(255, 255, 255, 0.1)',
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#FFFFFF',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tareas',
          tabBarLabel: 'Tareas',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="assignment" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

