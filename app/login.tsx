import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useUser } from '../context/UserContext';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { login, register } from '../services/apiService';

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailFocused, setEmailFocused] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const { setEmail: setUserEmail, setToken } = useUser();

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({ email: email.trim(), password: password.trim() });
      
      // Save user data in context
      setUserEmail(email.trim());
      setToken(response.data.token);
      
      // Navigate to tabs
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'No se pudo iniciar sesión. Verifica tu conexión a internet.';
      
      if (error.status === 401) {
        errorMessage = 'Email o contraseña incorrectos. Por favor verifica tus credenciales.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Error de inicio de sesión',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (!password.trim() || password.trim().length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await register({ email: email.trim(), password: password.trim() });
      
      // Save user data in context
      setUserEmail(email.trim());
      setToken(response.data.token);
      
      // Navigate to tabs
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Register error:', error);
      let errorMessage = 'No se pudo crear la cuenta. Verifica tu conexión a internet.';
      
      if (error.status === 400) {
        errorMessage = 'Este email ya está registrado o los datos son inválidos. Intenta iniciar sesión o usa otro email.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Error de registro',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />

      {/* Background with gradient effect */}
      <View style={styles.background}>
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="person" size={64} color="#10B981" />
          </View>
          <Text style={styles.titleText}>Login</Text>
          <Text style={styles.subtitleText}>Inicia sesión para continuar</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <View style={[styles.inputContainer, emailFocused && styles.inputFocused]}>
              <MaterialIcons
                name="email"
                size={20}
                color={emailFocused ? '#10B981' : '#94A3B8'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>



          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <View style={[styles.inputContainer, passwordFocused && styles.inputFocused]}>
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={passwordFocused ? '#10B981' : '#94A3B8'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, (isLoading || !email.trim() || !password.trim()) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading || !email.trim() || !password.trim()}
            activeOpacity={0.8}
          >
            {isLoading && !isRegistering ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Iniciar sesión</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.buttonSecondary, (isLoading || !email.trim() || !password.trim()) && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading || !email.trim() || !password.trim()}
            activeOpacity={0.8}
          >
            {isLoading && isRegistering ? (
              <ActivityIndicator color="#3B82F6" />
            ) : (
              <>
                <Text style={styles.buttonSecondaryText}>Crear cuenta</Text>
                <MaterialIcons name="person-add" size={20} color="#3B82F6" />
              </>
            )}
          </TouchableOpacity>

          {/* Hint */}
          <Text style={styles.hint}>
            💡 Contraseña mínima: 6 caracteres{'\n'}Conectado al backend real
          </Text>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure black base
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0E1A', // Very dark blue-black
  },
  gradientCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#1E3A8A', // Navy blue
    top: -150,
    right: -100,
    opacity: 0.3,
  },
  gradientCircle2: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#3B82F6', // Bright blue
    bottom: -100,
    left: -80,
    opacity: 0.2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.2)', // Translucent blue
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  titleText: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF', // White text on dark
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textShadowColor: 'rgba(59, 130, 246, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: '#60A5FA', // Light blue
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Glassmorphism
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  },
  inputFocused: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF', // White text
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6', // Bright blue for CTA
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  hint: {
    marginTop: 24,
    textAlign: 'center',
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  buttonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  buttonSecondaryText: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

