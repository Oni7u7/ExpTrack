import { supabase } from '../config/supabase';

// Función auxiliar para formatear fecha en formato YYYY-MM-DD usando hora local
const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
          fecha_otorgada: formatDateLocal(new Date()),
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

// Verificar y otorgar recompensas automáticamente cuando un límite se completa
export const verificarYOtorgarRecompensa = async (userId, limiteId) => {
  try {
    // Obtener el límite
    const { data: limite, error: limiteError } = await supabase
      .from('limites')
      .select('*')
      .eq('id', limiteId)
      .eq('user_id', userId)
      .single();

    if (limiteError || !limite) {
      return { error: 'Límite no encontrado', data: null };
    }

    // Verificar si ya se otorgó una recompensa para este límite
    const { data: recompensaExistente } = await supabase
      .from('recompensas')
      .select('*')
      .eq('user_id', userId)
      .eq('semana', `Límite ${limiteId}`)
      .single();

    if (recompensaExistente) {
      // Ya se otorgó recompensa para este límite
      return { data: null, error: null, yaOtorgada: true };
    }

    const porcentajeUso = (limite.gasto_total || 0) / limite.monto_limite;
    const hoy = formatDateLocal(new Date());
    const fechaFinLimite = limite.fecha_fin;

    // Solo otorgar recompensa si el límite ya terminó y el usuario cumplió
    if (fechaFinLimite < hoy) {
      let puntos = 0;
      let titulo = '';
      let descripcion = '';

      if (porcentajeUso <= 0.8) {
        // Excelente: gastó menos del 80% del límite
        puntos = 100;
        titulo = '🌟 Excelente Control';
        descripcion = `Mantuviste tus gastos bajo control. Gastaste solo el ${(porcentajeUso * 100).toFixed(1)}% de tu límite de ${limite.monto_limite.toFixed(2)}.`;
      } else if (porcentajeUso <= 1.0) {
        // Bueno: gastó entre 80% y 100% del límite
        puntos = 50;
        titulo = '✅ Límite Cumplido';
        descripcion = `Lograste mantenerte dentro de tu límite. Gastaste el ${(porcentajeUso * 100).toFixed(1)}% de tu límite de ${limite.monto_limite.toFixed(2)}.`;
      } else {
        // Se pasó del límite, no otorgar recompensa
        return { data: null, error: null, noOtorgada: true };
      }

      // Otorgar la recompensa
      const { data: nuevaRecompensa, error: recompensaError } = await addRecompensa(
        userId,
        `Límite ${limiteId}`,
        puntos,
        titulo,
        descripcion
      );

      if (recompensaError) {
        return { error: recompensaError, data: null };
      }

      return { data: nuevaRecompensa, error: null };
    }

    return { data: null, error: null, pendiente: true };
  } catch (error) {
    return { error: error.message || 'Error al verificar recompensa', data: null };
  }
};




