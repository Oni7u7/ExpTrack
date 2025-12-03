import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { getGastos } from '../services/gastosService';
import { colors } from '../config/colors';

const screenWidth = Dimensions.get('window').width;
const CHART_WIDTH = screenWidth - 80;
const CHART_HEIGHT = 200;

// Componente de gráfica de barras personalizada
const BarChartCustom = ({ data, labels, maxValue }) => {
  const barWidth = (CHART_WIDTH - 40) / labels.length - 10;
  const maxBarHeight = CHART_HEIGHT - 60;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.barChart}>
        {data.map((value, index) => {
          const barHeight = maxValue > 0 ? (value / maxValue) * maxBarHeight : 0;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, 2),
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>
                {labels[index]}
              </Text>
              <Text style={styles.barValue}>
                ${value.toFixed(0)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Componente de gráfica de pastel simplificada (usando barras horizontales)
const PieChartCustom = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={styles.pieChartContainer}>
      {data.map((item, index) => {
        const percentage = total > 0 ? (item.amount / total) * 100 : 0;
        return (
          <View key={index} style={styles.pieItem}>
            <View style={styles.pieItemHeader}>
              <View
                style={[
                  styles.pieColorIndicator,
                  { backgroundColor: item.color },
                ]}
              />
              <Text style={styles.pieItemName}>{item.name}</Text>
              <Text style={styles.pieItemPercentage}>
                {percentage.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.pieBarContainer}>
              <View
                style={[
                  styles.pieBar,
                  {
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.pieItemAmount}>
              ${item.amount.toFixed(2)}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// Componente de gráfica de línea simplificada (sin mostrar valores de dinero)
const LineChartCustom = ({ data, labels }) => {
  const maxValue = Math.max(...data, 1);
  const chartHeight = CHART_HEIGHT - 60;
  const chartWidth = CHART_WIDTH - 40;
  // Calcular el espaciado para que los puntos estén centrados con las etiquetas
  // Las etiquetas están distribuidas uniformemente, así que dividimos el ancho entre el número de puntos
  const pointSpacing = data.length > 1 ? chartWidth / (data.length - 1) : 0;

  // Calcular posiciones de los puntos
  const points = data.map((value, index) => {
    const y = chartHeight - (value / maxValue) * chartHeight;
    // Ajustar la posición x para que esté centrada con las etiquetas
    const x = index * pointSpacing;
    return { x, y, value };
  });

  return (
    <View style={styles.chartContainer}>
      <View style={styles.lineChart}>
        <View style={styles.lineChartArea}>
          {/* Líneas de fondo horizontales */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <View
              key={i}
              style={[
                styles.lineChartGrid,
                {
                  top: 20 + ratio * chartHeight,
                },
              ]}
            />
          ))}
          
          {/* Línea de datos */}
          <View style={styles.linePathContainer}>
            {points.map((point, index) => {
              if (index === 0) {
                return (
                  <View
                    key={index}
                    style={[
                      styles.linePoint,
                      {
                        left: 20 + point.x - 4,
                        top: 20 + point.y - 4,
                      },
                    ]}
                  />
                );
              }
              
              const prevPoint = points[index - 1];
              const dx = point.x - prevPoint.x;
              const dy = point.y - prevPoint.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              
              return (
                <View key={index}>
                  {/* Línea conectora */}
                  <View
                    style={[
                      styles.lineConnector,
                      {
                        left: 20 + prevPoint.x,
                        top: 20 + prevPoint.y,
                        width: length,
                        transform: [{ rotate: `${angle}deg` }],
                      },
                    ]}
                  />
                  {/* Punto */}
                  <View
                    style={[
                      styles.linePoint,
                      {
                        left: 20 + point.x - 4,
                        top: 20 + point.y - 4,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>
        
        {/* Etiquetas (solo días, sin valores) */}
        <View style={styles.lineChartLabels}>
          {labels.map((label, index) => {
            // Calcular la posición x del punto correspondiente para centrar la etiqueta
            const pointX = index * pointSpacing;
            return (
              <View
                key={index}
                style={[
                  styles.lineChartLabelContainer,
                  {
                    left: 20 + pointX - 20, // Centrar la etiqueta (ancho del contenedor / 2)
                  },
                ]}
              >
                <Text style={styles.lineChartLabel} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default function HomeTab({ userId }) {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gastosPorCategoria, setGastosPorCategoria] = useState([]);
  const [gastosPorMes, setGastosPorMes] = useState({ labels: [], data: [] });
  const [gastosPorDia, setGastosPorDia] = useState({ labels: [], data: [] });
  const [gastoTotal, setGastoTotal] = useState(0);
  const [gastoPromedio, setGastoPromedio] = useState(0);

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
        setGastos([]);
      } else {
        setGastos(data || []);
        processGastosData(data || []);
      }
    } catch (err) {
      console.error('Excepción al cargar gastos:', err);
      setGastos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processGastosData = (gastosData) => {
    // Calcular total y promedio
    const total = gastosData.reduce((sum, gasto) => sum + parseFloat(gasto.monto || 0), 0);
    const promedio = gastosData.length > 0 ? total / gastosData.length : 0;
    setGastoTotal(total);
    setGastoPromedio(promedio);

    // Procesar gastos por categoría
    const categoriaMap = {};
    gastosData.forEach((gasto) => {
      const categoriaNombre = gasto.categorias?.nombre || 'Sin categoría';
      if (!categoriaMap[categoriaNombre]) {
        categoriaMap[categoriaNombre] = 0;
      }
      categoriaMap[categoriaNombre] += parseFloat(gasto.monto || 0);
    });

    const categoriasData = Object.entries(categoriaMap).map(([nombre, monto]) => ({
      name: nombre,
      amount: monto,
      color: getColorForCategory(nombre),
    }));

    setGastosPorCategoria(categoriasData);

    // Procesar gastos por mes (últimos 6 meses)
    const mesMap = {};
    const meses = [];
    const hoyMes = new Date();
    
    // Crear array de los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoyMes.getFullYear(), hoyMes.getMonth() - i, 1);
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const mesLabel = fecha.toLocaleDateString('es-ES', { month: 'short' });
      meses.push({ key: mesKey, label: mesLabel });
      mesMap[mesKey] = 0;
    }

    gastosData.forEach((gasto) => {
      const fechaGasto = new Date(gasto.fecha);
      const mesKey = `${fechaGasto.getFullYear()}-${String(fechaGasto.getMonth() + 1).padStart(2, '0')}`;
      if (mesMap.hasOwnProperty(mesKey)) {
        mesMap[mesKey] += parseFloat(gasto.monto || 0);
      }
    });

    const mesesData = {
      labels: meses.map(m => m.label),
      data: meses.map(m => mesMap[m.key]),
    };

    setGastosPorMes(mesesData);

    // Procesar gastos por día (últimos 7 días)
    const diaMap = {};
    const dias = [];
    const hoyDia = new Date();
    // Ajustar a hora local para evitar problemas de zona horaria
    hoyDia.setHours(12, 0, 0, 0);
    
    // Crear array de los últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoyDia);
      fecha.setDate(fecha.getDate() - i);
      // Formatear fecha en formato YYYY-MM-DD usando hora local
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      const diaKey = `${year}-${month}-${day}`;
      // Formato: día/mes (ej: 01/12)
      const diaLabel = `${day}/${month}`;
      dias.push({ key: diaKey, label: diaLabel });
      diaMap[diaKey] = 0;
    }

    gastosData.forEach((gasto) => {
      // Parsear la fecha directamente sin conversión a UTC para evitar desfases
      const fechaParts = gasto.fecha.split('-');
      if (fechaParts.length === 3) {
        const diaKey = gasto.fecha; // Ya está en formato YYYY-MM-DD
        if (diaMap.hasOwnProperty(diaKey)) {
          diaMap[diaKey] += parseFloat(gasto.monto || 0);
        }
      }
    });

    const diasData = {
      labels: dias.map(d => d.label),
      data: dias.map(d => diaMap[d.key]),
    };

    setGastosPorDia(diasData);
  };

  const getColorForCategory = (categoriaNombre) => {
    const colorMap = {
      'Comida': '#FF6B6B',
      'Transporte': '#4ECDC4',
      'Entretenimiento': '#45B7D1',
      'Servicios': '#FFA07A',
      'Salud': '#98D8C8',
      'Sin categoría': '#95A5A6',
    };
    return colorMap[categoriaNombre] || colors.primary;
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
        <Text style={styles.loadingText}>Cargando gráficas...</Text>
      </View>
    );
  }

  if (gastos.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Resumen de Gastos</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay gastos registrados aún</Text>
          <Text style={styles.emptySubtext}>
            Agrega gastos para ver gráficas y estadísticas
          </Text>
        </View>
      </ScrollView>
    );
  }

  const maxBarValue = gastosPorMes.data.length > 0 
    ? Math.max(...gastosPorMes.data, 1) 
    : 1;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Resumen de Gastos</Text>

      {/* Resumen de totales */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Gastado</Text>
            <Text style={styles.summaryValue}>{formatCurrency(gastoTotal)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Promedio por Gasto</Text>
            <Text style={styles.summaryValue}>{formatCurrency(gastoPromedio)}</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total de Gastos</Text>
            <Text style={styles.summaryValue}>{gastos.length}</Text>
          </View>
        </View>
      </View>

      {/* Gráfica de pastel por categoría */}
      {gastosPorCategoria.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Gastos por Categoría</Text>
          <PieChartCustom data={gastosPorCategoria} />
        </View>
      )}

      {/* Gráfica de barras por mes */}
      {gastosPorMes.labels && gastosPorMes.labels.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Gastos por Mes (Últimos 6 meses)</Text>
          <BarChartCustom
            data={gastosPorMes.data}
            labels={gastosPorMes.labels}
            maxValue={maxBarValue}
          />
        </View>
      )}

      {/* Gráfica de línea por día (sin mostrar valores) */}
      {gastosPorDia.labels && gastosPorDia.labels.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Tendencia de Gastos por Día</Text>
          <LineChartCustom
            data={gastosPorDia.data}
            labels={gastosPorDia.labels}
          />
        </View>
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
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors['900'],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  chartCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors['900'],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  // Estilos para gráfica de pastel
  pieChartContainer: {
    width: '100%',
  },
  pieItem: {
    marginBottom: 16,
  },
  pieItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pieColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  pieItemName: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  pieItemPercentage: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pieBarContainer: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  pieBar: {
    height: '100%',
    borderRadius: 4,
  },
  pieItemAmount: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  // Estilos para gráfica de barras
  chartContainer: {
    width: '100%',
    alignItems: 'center',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: CHART_HEIGHT,
    width: CHART_WIDTH,
    paddingHorizontal: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: CHART_HEIGHT - 60,
    justifyContent: 'flex-end',
    width: '100%',
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    width: '100%',
  },
  barValue: {
    fontSize: 9,
    color: colors.textTertiary,
    marginTop: 4,
  },
  // Estilos para gráfica de línea
  lineChart: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
  },
  lineChartArea: {
    width: '100%',
    height: CHART_HEIGHT - 40,
    position: 'relative',
  },
  lineChartGrid: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  linePathContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  lineConnector: {
    position: 'absolute',
    height: 2,
    backgroundColor: colors.primary,
    transformOrigin: 'left center',
  },
  linePoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.cardBackground,
  },
  lineChartLabels: {
    position: 'relative',
    height: 30,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  lineChartLabelContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 40,
    transform: [{ translateX: -20 }], // Centrar el contenedor en su posición
  },
  lineChartLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
