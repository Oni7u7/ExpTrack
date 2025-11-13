import { supabase } from '../config/supabase';

// Obtener todos los gastos de un usuario
export const getGastos = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('gastos')
      .select(`
        *,
        categorias (
          id,
          nombre
        )
      `)
      .eq('user_id', userId)
      .order('fecha', { ascending: false });

    if (error) {
      return { error: error.message, data: null };
    }

    return { data, error: null };
  } catch (error) {
    return { error: error.message || 'Error al obtener gastos', data: null };
  }
};

// Agregar un nuevo gasto
export const addGasto = async (userId, categoriaId, monto, descripcion, fecha) => {
  try {
    if (!monto || monto <= 0) {
      return { error: 'El monto debe ser mayor a 0', data: null };
    }

    const { data, error } = await supabase
      .from('gastos')
      .insert([
        {
          user_id: userId,
          categoria_id: categoriaId || null,
          monto: parseFloat(monto),
          descripcion: descripcion || null,
          fecha: fecha || new Date().toISOString().split('T')[0],
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    return { data, error: null };
  } catch (error) {
    return { error: error.message || 'Error al agregar gasto', data: null };
  }
};

// Eliminar un gasto
export const deleteGasto = async (gastoId) => {
  try {
    const { error } = await supabase
      .from('gastos')
      .delete()
      .eq('id', gastoId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return { error: error.message || 'Error al eliminar gasto' };
  }
};

// Obtener gastos por rango de fechas
export const getGastosByDateRange = async (userId, fechaInicio, fechaFin) => {
  try {
    const { data, error } = await supabase
      .from('gastos')
      .select(`
        *,
        categorias (
          id,
          nombre
        )
      `)
      .eq('user_id', userId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)
      .order('fecha', { ascending: false });

    if (error) {
      return { error: error.message, data: null };
    }

    return { data, error: null };
  } catch (error) {
    return { error: error.message || 'Error al obtener gastos', data: null };
  }
};


