import { supabase } from '../config/supabase';

// Obtener el límite actual de un usuario
export const getLimiteActual = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('limites')
      .select('*')
      .eq('user_id', userId)
      .gte('fecha_fin', today)
      .lte('fecha_inicio', today)
      .order('fecha_inicio', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return { error: error.message, data: null };
    }

    return { data: data || null, error: null };
  } catch (error) {
    return { error: error.message || 'Error al obtener límite', data: null };
  }
};

// Crear o actualizar un límite
export const setLimite = async (userId, montoLimite, fechaInicio, fechaFin) => {
  try {
    if (!montoLimite || montoLimite <= 0) {
      return { error: 'El monto límite debe ser mayor a 0', data: null };
    }

    const { data, error } = await supabase
      .from('limites')
      .insert([
        {
          user_id: userId,
          monto_limite: parseFloat(montoLimite),
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          gasto_total: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    return { data, error: null };
  } catch (error) {
    return { error: error.message || 'Error al establecer límite', data: null };
  }
};

// Actualizar el gasto total de un límite
export const updateGastoTotal = async (limiteId, gastoTotal) => {
  try {
    const { data, error } = await supabase
      .from('limites')
      .update({ gasto_total: parseFloat(gastoTotal) })
      .eq('id', limiteId)
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    return { data, error: null };
  } catch (error) {
    return { error: error.message || 'Error al actualizar gasto total', data: null };
  }
};


