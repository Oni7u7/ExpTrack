import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getLimiteActual, getAllLimites, setLimite, updateGastoTotal } from '../services/limitesService';
import { getGastosByDateRange } from '../services/gastosService';
import { verificarYOtorgarRecompensa } from '../services/recompensasService';
import { colors } from '../config/colors';

// Función auxiliar para formatear fecha en formato YYYY-MM-DD usando hora local
const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function LimiteTab({ userId }) {
  const [limites, setLimites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [montoLimite, setMontoLimite] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userId) {
      loadLimites();
      // Establecer fechas por defecto (mes actual)
      const hoy = new Date();
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      
      setFechaInicio(formatDateLocal(primerDia));
      setFechaFin(formatDateLocal(ultimoDia));
    }
  }, [userId]);

  const loadLimites = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await getAllLimites(userId);
      if (error) {
        console.error('Error al cargar límites:', error);
        setLimites([]);
      } else {
        setLimites(data || []);
        
        // Verificar y otorgar recompensas para límites concluidos
        if (data && data.length > 0) {
          const hoy = formatDateLocal(new Date());
          for (const limite of data) {
            // Si el límite ya terminó, verificar si se debe otorgar recompensa
            if (limite.fecha_fin < hoy) {
              try {
                await verificarYOtorgarRecompensa(userId, limite.id);
              } catch (err) {
                // No mostrar error al usuario, solo log
                console.log('Error al verificar recompensa:', err);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Excepción al cargar límites:', err);
      setLimites([]);
    } finally {
      setLoading(false);
    }
  };

  const calcularLimiteDesdeGastos = async () => {
    try {
      // Calcular el período anterior (mes anterior)
      const hoy = new Date();
      const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      
      const fechaInicioAnterior = formatDateLocal(primerDiaMesAnterior);
      const fechaFinAnterior = formatDateLocal(ultimoDiaMesAnterior);

      // Obtener gastos del mes anterior
      const { data: gastosAnteriores, error } = await getGastosByDateRange(
        userId,
        fechaInicioAnterior,
        fechaFinAnterior
      );

      if (error) {
        Alert.alert('Error', 'No se pudieron obtener los gastos anteriores');
        return;
      }

      // Calcular el total de gastos anteriores
      const totalGastos = gastosAnteriores?.reduce(
        (sum, gasto) => sum + parseFloat(gasto.monto || 0),
        0
      ) || 0;

      if (totalGastos === 0) {
        Alert.alert(
          'Información',
          'No se encontraron gastos en el mes anterior. Por favor, ingresa un monto manualmente.'
        );
        setShowForm(true);
        return;
      }

      // Establecer el monto del límite basado en los gastos anteriores
      setMontoLimite(totalGastos.toFixed(2));
      setShowForm(true);
      
      Alert.alert(
        'Límite Calculado',
        `Se ha calculado un límite de ${formatCurrency(totalGastos)} basado en tus gastos del mes anterior. Puedes ajustarlo si lo deseas.`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Error al calcular límite:', err);
      Alert.alert('Error', 'Error al calcular el límite desde gastos anteriores');
    }
  };

  const handleSetLimite = async () => {
    if (!montoLimite || parseFloat(montoLimite) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    if (!fechaInicio || !fechaFin) {
      Alert.alert('Error', 'Por favor ingresa las fechas de inicio y fin');
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      Alert.alert('Error', 'La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await setLimite(
        userId,
        montoLimite,
        fechaInicio,
        fechaFin
      );

      if (error) {
        Alert.alert('Error', error);
      } else {
        // Calcular el gasto total del nuevo período para llenar la barra
        try {
          const { data: gastosPeriodo } = await getGastosByDateRange(
            userId,
            fechaInicio,
            fechaFin
          );

          if (gastosPeriodo && gastosPeriodo.length > 0) {
            const gastoTotal = gastosPeriodo.reduce(
              (sum, gasto) => sum + parseFloat(gasto.monto || 0),
              0
            );
            
            // Actualizar el gasto_total del límite recién creado
            await updateGastoTotal(data.id, gastoTotal);
          }
        } catch (updateError) {
          console.error('Error al actualizar gasto total:', updateError);
        }

        Alert.alert('Éxito', 'Límite establecido correctamente', [
          {
            text: 'OK',
            onPress: () => {
              setMontoLimite('');
              setShowForm(false);
              loadLimites();
            },
          },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', 'Error al establecer el límite');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    // Parsear la fecha directamente sin conversión a UTC
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const getLimiteEstado = (limite) => {
    const today = formatDateLocal(new Date());
    if (limite.fecha_inicio <= today && limite.fecha_fin >= today) {
      return 'activo';
    } else if (limite.fecha_fin < today) {
      return 'concluido';
    } else {
      return 'futuro';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Límite de Gastos</Text>

      {limites.length > 0 ? (
        limites.map((limite) => {
          const estado = getLimiteEstado(limite);
          return (
            <View key={limite.id} style={styles.limiteCard}>
              <View style={styles.limiteHeader}>
                <Text style={styles.limiteTitle}>
                  {estado === 'activo' ? 'Límite Activo' : estado === 'concluido' ? 'Límite Concluido' : 'Límite'}
                </Text>
                {estado === 'activo' && (
                  <View style={styles.activoBadge}>
                    <Text style={styles.activoBadgeText}>ACTIVO</Text>
                  </View>
                )}
                {estado === 'concluido' && (
                  <View style={styles.concluidoBadge}>
                    <Text style={styles.concluidoBadgeText}>CONCLUIDO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.limiteMonto}>{formatCurrency(limite.monto_limite)}</Text>
              
              <View style={styles.limiteInfoPeriodo}>
                <Text style={styles.limiteLabel}>Período:</Text>
                <View style={styles.limiteValueContainer}>
                  <Text style={styles.limiteValue} numberOfLines={2}>
                    {formatDate(limite.fecha_inicio)} - {formatDate(limite.fecha_fin)}
                  </Text>
                </View>
              </View>

              <View style={styles.limiteInfo}>
                <Text style={styles.limiteLabel}>Gastado:</Text>
                <Text style={styles.limiteGasto}>
                  {formatCurrency(limite.gasto_total || 0)}
                </Text>
              </View>

              <View style={styles.limiteInfo}>
                <Text style={styles.limiteLabel}>Restante:</Text>
                <Text style={[
                  styles.limiteRestante,
                  (limite.monto_limite - (limite.gasto_total || 0)) < 0 && styles.limiteRestanteNegativo
                ]}>
                  {formatCurrency(limite.monto_limite - (limite.gasto_total || 0))}
                </Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          ((limite.gasto_total || 0) / limite.monto_limite) * 100,
                          100
                        )}%`,
                        backgroundColor: 
                          ((limite.gasto_total || 0) / limite.monto_limite) * 100 > 80
                            ? colors.error
                            : ((limite.gasto_total || 0) / limite.monto_limite) * 100 > 50
                            ? colors.warning
                            : colors.success,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.min(
                    ((limite.gasto_total || 0) / limite.monto_limite) * 100,
                    100
                  ).toFixed(1)}%
                </Text>
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.noLimiteCard}>
          <Text style={styles.noLimiteText}>
            No tienes límites establecidos
          </Text>
          <Text style={styles.noLimiteSubtext}>
            Establece un límite para controlar tus gastos
          </Text>
        </View>
      )}

      {!showForm ? (
        <TouchableOpacity
          style={styles.addButton}
          onPress={calcularLimiteDesdeGastos}
        >
          <Text style={styles.addButtonText}>
            Agregar Nuevo Límite
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            Nuevo Límite
          </Text>

          <Text style={styles.label}>Monto Límite *</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={montoLimite}
            onChangeText={setMontoLimite}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Fecha de Inicio *</Text>
          <TextInput
            style={styles.input}
            value={fechaInicio}
            onChangeText={setFechaInicio}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Fecha de Fin *</Text>
          <TextInput
            style={styles.input}
            value={fechaFin}
            onChangeText={setFechaFin}
            placeholder="YYYY-MM-DD"
          />

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => {
                setShowForm(false);
                setMontoLimite('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, styles.submitButton]}
              onPress={handleSetLimite}
              disabled={saving}
            >
              <Text style={styles.submitButtonText}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 80,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.textPrimary,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  limiteCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors['900'],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  limiteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  limiteTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  activoBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  concluidoBadge: {
    backgroundColor: colors.textTertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  concluidoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  limiteMonto: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  limiteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  limiteInfoPeriodo: {
    marginBottom: 12,
  },
  limiteLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  limiteValueContainer: {
    flex: 1,
  },
  limiteValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
    flexWrap: 'wrap',
  },
  limiteGasto: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  limiteRestante: {
    fontSize: 16,
    color: colors.success,
    fontWeight: 'bold',
  },
  limiteRestanteNegativo: {
    color: colors.error,
  },
  progressBarContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.borderLight,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'right',
  },
  noLimiteCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 40,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  noLimiteText: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  noLimiteSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: colors.buttonPrimaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors['900'],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  formButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: colors.buttonSecondary,
  },
  cancelButtonText: {
    color: colors.buttonSecondaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.buttonPrimary,
  },
  submitButtonText: {
    color: colors.buttonPrimaryText,
    fontSize: 16,
    fontWeight: '600',
  },
});

