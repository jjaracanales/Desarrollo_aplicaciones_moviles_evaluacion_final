import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { UserProvider, useUser } from '../context/UserContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup) {
      // User is not authenticated but trying to access protected routes
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup) {
      // User is authenticated but on login/index screen
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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <RootLayoutNav />
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

