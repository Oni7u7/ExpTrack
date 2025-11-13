import { supabase } from '../config/supabase';
import CryptoJS from 'crypto-js';

// Función para hashear contraseñas
const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

// Función para registrar un nuevo usuario
export const registerUser = async (nombre, email, password) => {
  try {
    // Validar que ningún campo esté vacío
    if (!nombre || !nombre.trim()) {
      return { error: 'El nombre es requerido' };
    }
    if (!email || !email.trim()) {
      return { error: 'El email es requerido' };
    }
    if (!password || !password.trim()) {
      return { error: 'La contraseña es requerida' };
    }

    // Verificar si el email ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from('usuarios')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return { error: 'El email ya está registrado' };
    }

    // Hashear la contraseña
    const hashedPassword = hashPassword(password);

    // Insertar el nuevo usuario
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          nombre,
          email,
          password: hashedPassword,
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Retornar datos del usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = data;
    return { data: userWithoutPassword, error: null };
  } catch (error) {
    return { error: error.message || 'Error al registrar usuario' };
  }
};

// Función para iniciar sesión
export const loginUser = async (email, password) => {
  try {
    // Validar que ningún campo esté vacío
    if (!email || !email.trim()) {
      return { error: 'El email es requerido' };
    }
    if (!password || !password.trim()) {
      return { error: 'La contraseña es requerida' };
    }

    // Hashear la contraseña para comparar
    const hashedPassword = hashPassword(password);

    // Buscar el usuario por email
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      return { error: 'Email o contraseña incorrectos' };
    }

    if (!data) {
      return { error: 'Email o contraseña incorrectos' };
    }

    // Verificar la contraseña
    if (data.password !== hashedPassword) {
      return { error: 'Email o contraseña incorrectos' };
    }

    // Retornar datos del usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = data;
    return { data: userWithoutPassword, error: null };
  } catch (error) {
    return { error: error.message || 'Error al iniciar sesión' };
  }
};

// Función para cerrar sesión (limpiar datos locales)
export const logoutUser = async () => {
  // En este caso, simplemente retornamos éxito ya que no usamos sesiones de Supabase
  return { error: null };
};

