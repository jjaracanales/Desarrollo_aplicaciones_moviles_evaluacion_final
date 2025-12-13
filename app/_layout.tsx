import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { UserProvider, useUser } from '../context/UserContext';
import { ApiNotificationProvider } from '../context/ApiNotificationContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import BackendStatusBadge from '../components/BackendStatusBadge';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup) {
      // Usuario no autenticado intentando acceder a rutas protegidas
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup) {
      // Usuario autenticado en pantalla login/index
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <>
      <BackendStatusBadge />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <ApiNotificationProvider>
        <RootLayoutNav />
      </ApiNotificationProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E1A',
  },
});

