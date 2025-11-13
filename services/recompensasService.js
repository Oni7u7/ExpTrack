import { supabase } from '../config/supabase';

// Obtener todas las recompensas de un usuario
export const getRecompensas = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('recompensas')
      .select('*')
      .eq('user_id', userId)
      .order('fecha_otorgada', { ascending: false });

    if (error) {
      return { error: error.message, data: null };
    }

    return { data, error: null };
  } catch (error) {
    return { error: error.message || 'Error al obtener recompensas', data: null };
  }
};

// Agregar una nueva recompensa
export const addRecompensa = async (userId, semana, puntos, titulo, descripcion) => {
  try {
    const { data, error } = await supabase
      .from('recompensas')
      .insert([
        {
          user_id: userId,
          semana: semana || null,
          puntos: puntos || 0,
          titulo: titulo || null,
          descripcion: descripcion || null,
          fecha_otorgada: new Date().toISOString().split('T')[0],
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    return { data, error: null };
  } catch (error) {
    return { error: error.message || 'Error al agregar recompensa', data: null };
  }
};


