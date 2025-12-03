import { supabase } from '../config/supabase';
import { getLimiteActual, updateGastoTotal } from './limitesService';

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

    const fechaGasto = fecha || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('gastos')
      .insert([
        {
          user_id: userId,
          categoria_id: categoriaId || null,
          monto: parseFloat(monto),
          descripcion: descripcion || null,
          fecha: fechaGasto,
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    // Actualizar el gasto_total de todos los límites que incluyan esta fecha
    let limiteRebasado = false;
    try {
      // Obtener todos los límites del usuario que incluyan la fecha del gasto
      const { data: limites, error: limitesError } = await supabase
        .from('limites')
        .select('*')
        .eq('user_id', userId)
        .lte('fecha_inicio', fechaGasto)
        .gte('fecha_fin', fechaGasto);

      if (!limitesError && limites && limites.length > 0) {
        // Actualizar cada límite que incluya esta fecha
        for (const limite of limites) {
          // Calcular el nuevo gasto total sumando todos los gastos del período
          const { data: gastosPeriodo } = await supabase
            .from('gastos')
            .select('monto')
            .eq('user_id', userId)
            .gte('fecha', limite.fecha_inicio)
            .lte('fecha', limite.fecha_fin);
          
          if (gastosPeriodo) {
            const nuevoGastoTotal = gastosPeriodo.reduce(
              (sum, gasto) => sum + parseFloat(gasto.monto || 0),
              0
            );
            
            await updateGastoTotal(limite.id, nuevoGastoTotal);
            
            // Verificar si se rebasó el límite (solo para límites activos)
            const hoy = new Date();
            const today = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
            if (limite.fecha_inicio <= today && limite.fecha_fin >= today) {
              if (nuevoGastoTotal > limite.monto_limite) {
                limiteRebasado = true;
              }
            }
          }
        }
      }
    } catch (limiteError) {
      // Si hay error al actualizar el límite, no fallar la operación de agregar gasto
      console.error('Error al actualizar límite:', limiteError);
    }

    return { data, error: null, limiteRebasado };
  } catch (error) {
    return { error: error.message || 'Error al agregar gasto', data: null };
  }
};

// Eliminar un gasto
export const deleteGasto = async (gastoId, userId) => {
  try {
    // Obtener el gasto antes de eliminarlo para actualizar el límite
    const { data: gasto } = await supabase
      .from('gastos')
      .select('*')
      .eq('id', gastoId)
      .single();

    const { error } = await supabase
      .from('gastos')
      .delete()
      .eq('id', gastoId);

    if (error) {
      return { error: error.message };
    }

    // Actualizar el gasto_total del límite si existe uno activo
    if (gasto && userId) {
      try {
        const { data: limite } = await getLimiteActual(userId);
        if (limite) {
          const fechaLimiteInicio = new Date(limite.fecha_inicio);
          const fechaLimiteFin = new Date(limite.fecha_fin);
          const fechaGastoDate = new Date(gasto.fecha);
          
          // Verificar si el gasto estaba dentro del período del límite
          if (fechaGastoDate >= fechaLimiteInicio && fechaGastoDate <= fechaLimiteFin) {
            // Calcular el nuevo gasto total sumando todos los gastos del período
            const { data: gastosPeriodo } = await supabase
              .from('gastos')
              .select('monto')
              .eq('user_id', userId)
              .gte('fecha', limite.fecha_inicio)
              .lte('fecha', limite.fecha_fin);
            
            if (gastosPeriodo) {
              const nuevoGastoTotal = gastosPeriodo.reduce(
                (sum, g) => sum + parseFloat(g.monto || 0),
                0
              );
              
              await updateGastoTotal(limite.id, nuevoGastoTotal);
            }
          }
        }
      } catch (limiteError) {
        // Si hay error al actualizar el límite, no fallar la operación de eliminar gasto
        console.error('Error al actualizar límite:', limiteError);
      }
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


