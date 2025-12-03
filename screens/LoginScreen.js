import React, { useState } from 'react';
import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { loginUser } from '../services/authService';
import { colors } from '../config/colors';

export default function LoginScreen({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validar formato de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar campos antes de enviar
  const validateFields = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(email.trim())) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleLogin = async () => {
    // Limpiar errores previos
    setErrors({});

    // Validar campos
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors).join('\n');
      Alert.alert('Error de validación', errorMessages);
      return;
    }

    setLoading(true);
    const result = await loginUser(email.trim(), password);

    setLoading(false);

    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      Alert.alert('Éxito', 'Inicio de sesión exitoso');
      onLoginSuccess(result.data);
    }
  };

  // Verificar si el formulario es válido para habilitar/deshabilitar el botón
  const isFormValid = email.trim() !== '' && password.trim() !== '';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Iniciar Sesión</Text>

        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) {
              setErrors({ ...errors, email: null });
            }
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Contraseña"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) {
              setErrors({ ...errors, password: null });
            }
          }}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <TouchableOpacity
          style={[
            styles.button,
            (!isFormValid || loading) && styles.buttonDisabled
          ]}
          onPress={handleLogin}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={onNavigateToRegister}
          disabled={loading}
        >
          <Text style={styles.linkText}>
            ¿No tienes cuenta? <Text style={styles.linkTextBold}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: colors.textPrimary,
  },
  input: {
    width: '100%',
    maxWidth: 350,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 5,
    fontSize: 16,
    backgroundColor: colors.cardBackground,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 10,
    marginTop: -5,
    width: '100%',
    maxWidth: 350,
    paddingLeft: 5,
  },
  button: {
    width: '100%',
    maxWidth: 350,
    height: 50,
    backgroundColor: colors.buttonPrimary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.buttonPrimaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  linkTextBold: {
    fontWeight: '600',
    color: colors.primary,
  },
  logo: {
    width: 330,
    height: 330,
    marginBottom: 20,
  },
});

