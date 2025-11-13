import { supabase } from '../config/supabase';

// Obtener todas las categorías
export const getCategorias = async () => {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      return { error: error.message, data: null };
    }

    return { data, error: null };
  } catch (error) {
    return { error: error.message || 'Error al obtener categorías', data: null };
  }
};

// Agregar una nueva categoría
export const addCategoria = async (nombre, descripcion) => {
  try {
    if (!nombre || !nombre.trim()) {
      return { error: 'El nombre de la categoría es requerido', data: null };
    }

    const { data, error } = await supabase
      .from('categorias')
      .insert([
        {
          nombre: nombre.trim(),
          descripcion: descripcion || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    return { data, error: null };
  } catch (error) {
    return { error: error.message || 'Error al agregar categoría', data: null };
  }
};


