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
} from 'react-native';
import { registerUser } from '../services/authService';
import { colors } from '../config/colors';

export default function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(email.trim())) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleRegister = async () => {
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
    const result = await registerUser(nombre.trim(), email.trim(), password);

    setLoading(false);

    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      Alert.alert('Éxito', 'Registro exitoso. Ahora puedes iniciar sesión');
      onRegisterSuccess(result.data);
    }
  };

  // Verificar si el formulario es válido para habilitar/deshabilitar el botón
  const isFormValid = 
    nombre.trim() !== '' &&
    email.trim() !== '' &&
    password.trim() !== '' &&
    confirmPassword.trim() !== '';

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Crear Cuenta</Text>

      <TextInput
        style={[styles.input, errors.nombre && styles.inputError]}
        placeholder="Nombre"
        value={nombre}
        onChangeText={(text) => {
          setNombre(text);
          if (errors.nombre) {
            setErrors({ ...errors, nombre: null });
          }
        }}
        autoCapitalize="words"
      />
      {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

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
          // Limpiar error de password y confirmPassword cuando se cambia
          const newErrors = { ...errors };
          if (newErrors.password) delete newErrors.password;
          if (newErrors.confirmPassword && text === confirmPassword) {
            delete newErrors.confirmPassword;
          }
          setErrors(newErrors);
        }}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TextInput
        style={[styles.input, errors.confirmPassword && styles.inputError]}
        placeholder="Confirmar Contraseña"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (errors.confirmPassword) {
            setErrors({ ...errors, confirmPassword: null });
          }
        }}
        secureTextEntry
        autoCapitalize="none"
      />
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

      <TouchableOpacity
        style={[
          styles.button,
          (!isFormValid || loading) && styles.buttonDisabled
        ]}
        onPress={handleRegister}
        disabled={!isFormValid || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={onNavigateToLogin}
        disabled={loading}
      >
        <Text style={styles.linkText}>
          ¿Ya tienes cuenta? <Text style={styles.linkTextBold}>Inicia Sesión</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
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

