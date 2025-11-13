import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { getGastos, deleteGasto } from '../services/gastosService';
import { colors } from '../config/colors';

export default function HistorialTab({ userId }) {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userId) {
      loadGastos();
    }
  }, [userId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGastos();
  }, []);

  const loadGastos = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await getGastos(userId);
      if (error) {
        console.error('Error al cargar gastos:', error);
        Alert.alert('Error', error);
        setGastos([]);
      } else {
        setGastos(data || []);
      }
    } catch (err) {
      console.error('Excepción al cargar gastos:', err);
      Alert.alert('Error', 'Error al cargar el historial de gastos');
      setGastos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = (gastoId) => {
    Alert.alert(
      'Eliminar Gasto',
      '¿Estás seguro de que quieres eliminar este gasto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteGasto(gastoId);
            if (error) {
              Alert.alert('Error', error);
            } else {
              loadGastos();
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Historial de Gastos</Text>
      
      {gastos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay gastos registrados</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadGastos}
          >
            <Text style={styles.refreshButtonText}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        gastos.map((gasto) => (
          <View key={gasto.id} style={styles.gastoCard}>
            <View style={styles.gastoHeader}>
              <View style={styles.gastoInfo}>
                <Text style={styles.gastoMonto}>{formatCurrency(gasto.monto)}</Text>
                <Text style={styles.gastoFecha}>{formatDate(gasto.fecha)}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(gasto.id)}
              >
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {gasto.categorias && (
              <View style={styles.categoriaBadge}>
                <Text style={styles.categoriaText}>{gasto.categorias.nombre}</Text>
              </View>
            )}
            
            {gasto.descripcion && (
              <Text style={styles.gastoDescripcion}>{gasto.descripcion}</Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: colors.buttonPrimary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  refreshButtonText: {
    color: colors.buttonPrimaryText,
    fontSize: 14,
    fontWeight: '600',
  },
  gastoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors['900'],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gastoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gastoInfo: {
    flex: 1,
  },
  gastoMonto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  gastoFecha: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.buttonDangerText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  categoriaText: {
    fontSize: 12,
    color: colors.buttonPrimaryText,
    fontWeight: '600',
  },
  gastoDescripcion: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
});


