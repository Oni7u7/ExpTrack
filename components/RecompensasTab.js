import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { getRecompensas, addRecompensa } from '../services/recompensasService';
import { colors } from '../config/colors';

export default function RecompensasTab({ userId, onAvatarUpdated }) {
  const [recompensas, setRecompensas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTienda, setShowTienda] = useState(false);

  // Items desbloqueables (usando la tabla recompensas existente)
  const itemsTienda = [
    { 
      id: 'avatar_bajo_btr', 
      nombre: 'Avatar Bajo BTR', 
      puntos: 100, 
      tipo: 'avatar', 
      descripcion: 'Imagen de perfil personalizada',
      imagen: require('../assets/images/bajo-btr.png')
    },
    { 
      id: 'avatar_miku-terr', 
      nombre: 'Avatar Mikku Terror', 
      puntos: 100, 
      tipo: 'avatar', 
      descripcion: 'Imagen de perfil personalizada',
      imagen: require('../assets/images/miku-terr.png')
    },
    { 
      id: 'avatar_ellen-joe', 
      nombre: 'Avatar Ellen Joe', 
      puntos: 120, 
      tipo: 'avatar', 
      descripcion: 'Imagen de perfil personalizada',
      imagen: require('../assets/images/ellen-zzz.png')
    },
  ];

  useEffect(() => {
    if (userId) {
      loadRecompensas();
    }
  }, [userId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRecompensas();
  }, []);

  const loadRecompensas = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await getRecompensas(userId);
      if (error) {
        console.error('Error al cargar recompensas:', error);
        setRecompensas([]);
      } else {
        setRecompensas(data || []);
      }
    } catch (err) {
      console.error('Excepción al cargar recompensas:', err);
      setRecompensas([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getPuntosTotales = () => {
    // Sumar solo las recompensas obtenidas (excluir desbloqueos que tienen puntos negativos)
    return recompensas
      .filter(r => !r.semana?.startsWith('desbloqueo_'))
      .reduce((sum, r) => sum + (r.puntos || 0), 0);
  };

  const getPuntosGastados = () => {
    // Sumar los puntos gastados en desbloqueos (son negativos, así que los convertimos a positivos)
    return recompensas
      .filter(r => r.semana?.startsWith('desbloqueo_'))
      .reduce((sum, r) => sum + Math.abs(r.puntos || 0), 0);
  };

  const isItemDesbloqueado = (itemId) => {
    // Verificar si el item ya está desbloqueado (almacenado como recompensa con semana = "desbloqueo_itemId")
    return recompensas.some(r => r.semana === `desbloqueo_${itemId}`);
  };

  const desbloquearItem = async (item) => {
    const puntosDisponibles = getPuntosTotales() - getPuntosGastados();
    
    if (puntosDisponibles < item.puntos) {
      Alert.alert(
        'Puntos Insuficientes',
        `Necesitas ${item.puntos} puntos para desbloquear este item. Tienes ${puntosDisponibles} puntos disponibles.`
      );
      return;
    }

    if (isItemDesbloqueado(item.id)) {
      Alert.alert('Ya Desbloqueado', 'Este item ya está desbloqueado.');
      return;
    }

    Alert.alert(
      'Confirmar Desbloqueo',
      `¿Deseas desbloquear "${item.nombre}" por ${item.puntos} puntos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desbloquear',
          onPress: async () => {
            try {
              // Guardar el desbloqueo como una recompensa especial
              // Usamos "semana" para identificar que es un desbloqueo
              const { error } = await addRecompensa(
                userId,
                `desbloqueo_${item.id}`,
                -item.puntos, // Puntos negativos para restar
                `Desbloqueado: ${item.nombre}`,
                item.descripcion
              );

              if (error) {
                Alert.alert('Error', 'No se pudo desbloquear el item.');
              } else {
                Alert.alert('¡Desbloqueado!', `Has desbloqueado "${item.nombre}".`);
                loadRecompensas();
                // Notificar que el avatar se actualizó (si es un avatar)
                if (item.tipo === 'avatar' && onAvatarUpdated) {
                  onAvatarUpdated();
                }
              }
            } catch (err) {
              Alert.alert('Error', 'Error al desbloquear el item.');
            }
          },
        },
      ]
    );
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
        <Text style={styles.loadingText}>Cargando recompensas...</Text>
      </View>
    );
  }

  const puntosTotales = getPuntosTotales();
  const recompensasObtenidas = recompensas.filter(r => !r.semana?.startsWith('desbloqueo_'));
  const itemsDesbloqueados = recompensas.filter(r => r.semana?.startsWith('desbloqueo_'));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recompensas</Text>
        <TouchableOpacity
          style={[styles.tiendaButton, showTienda && styles.tiendaButtonActive]}
          onPress={() => setShowTienda(!showTienda)}
        >
          <Text style={styles.tiendaButtonText}>
            {showTienda ? 'Recompensas' : 'Tienda'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Resumen de puntos totales */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Puntos Disponibles</Text>
        <Text style={styles.summaryValue}>{puntosTotales - getPuntosGastados()}</Text>
        <Text style={styles.summarySubtext}>
          {getPuntosGastados() > 0 && `${getPuntosGastados()} pts gastados`}
          {getPuntosGastados() === 0 && 'pts disponibles'}
        </Text>
      </View>

      {showTienda ? (
        /* TIENDA - Items desbloqueables */
        <View>
          <Text style={styles.sectionTitle}>Tienda de Desbloqueos</Text>
          <Text style={styles.sectionSubtitle}>
            Canjea tus puntos por items especiales
          </Text>
          
          {itemsTienda.map((item) => {
            const desbloqueado = isItemDesbloqueado(item.id);
            const puntosDisponibles = puntosTotales - getPuntosGastados();
            const puedeComprar = puntosDisponibles >= item.puntos;
            
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.itemCard,
                  desbloqueado && styles.itemCardDesbloqueado,
                  !puedeComprar && !desbloqueado && styles.itemCardBloqueado,
                ]}
                onPress={() => !desbloqueado && desbloquearItem(item)}
                disabled={desbloqueado}
              >
                <View style={styles.itemHeader}>
                  {item.imagen && (
                    <Image 
                      source={item.imagen} 
                      style={styles.itemImagen}
                      resizeMode="contain"
                    />
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemNombre}>{item.nombre}</Text>
                    <Text style={styles.itemDescripcion}>{item.descripcion}</Text>
                  </View>
                  <View style={styles.itemPuntos}>
                    {desbloqueado ? (
                      <Text style={styles.itemDesbloqueadoText}>✓</Text>
                    ) : (
                      <>
                        <Text style={styles.itemPuntosValue}>{item.puntos}</Text>
                        <Text style={styles.itemPuntosLabel}>pts</Text>
                      </>
                    )}
                  </View>
                </View>
                {desbloqueado && (
                  <Text style={styles.itemEstado}>Desbloqueado</Text>
                )}
                {!puedeComprar && !desbloqueado && (
                  <Text style={styles.itemEstado}>Puntos insuficientes</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        /* RECOMPENSAS OBTENIDAS */
        <>
          {recompensasObtenidas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tienes recompensas aún</Text>
              <Text style={styles.emptySubtext}>
                Mantén el control de tus gastos para obtener recompensas
              </Text>
            </View>
          ) : (
            <>
              {/* Lista de recompensas obtenidas */}
              {recompensasObtenidas.map((recompensa) => (
                <View key={recompensa.id} style={styles.recompensaCard}>
                  <View style={styles.recompensaHeader}>
                    <View style={styles.recompensaInfo}>
                      <Text style={styles.recompensaTitulo}>
                        {recompensa.titulo || 'Recompensa'}
                      </Text>
                      {recompensa.semana && !recompensa.semana.startsWith('desbloqueo_') && (
                        <Text style={styles.recompensaSemana}>
                          {recompensa.semana}
                        </Text>
                      )}
                    </View>
                    <View style={styles.puntosContainer}>
                      <Text style={styles.puntosValue}>{recompensa.puntos || 0}</Text>
                      <Text style={styles.puntosLabel}>pts</Text>
                    </View>
                  </View>
                  
                  {recompensa.descripcion && (
                    <Text style={styles.recompensaDescripcion}>
                      {recompensa.descripcion}
                    </Text>
                  )}
                  
                  <Text style={styles.recompensaFecha}>
                    Otorgada: {formatDate(recompensa.fecha_otorgada)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </>
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
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors['900'],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
  },
  summarySubtext: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  recompensaCard: {
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
  recompensaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recompensaInfo: {
    flex: 1,
    marginRight: 12,
  },
  recompensaTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  recompensaSemana: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  puntosContainer: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
  },
  puntosValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.buttonPrimaryText,
  },
  puntosLabel: {
    fontSize: 10,
    color: colors.buttonPrimaryText,
    textTransform: 'uppercase',
  },
  recompensaDescripcion: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  recompensaFecha: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tiendaButton: {
    backgroundColor: colors.buttonSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tiendaButtonActive: {
    backgroundColor: colors.buttonPrimary,
  },
  tiendaButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors['900'],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemCardDesbloqueado: {
    borderColor: colors.success,
    backgroundColor: colors.backgroundSecondary,
  },
  itemCardBloqueado: {
    opacity: 0.6,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImagen: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: colors.backgroundSecondary,
  },
  itemInfo: {
    flex: 1,
  },
  itemNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemDescripcion: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemPuntos: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
  },
  itemPuntosValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.buttonPrimaryText,
  },
  itemPuntosLabel: {
    fontSize: 10,
    color: colors.buttonPrimaryText,
    textTransform: 'uppercase',
  },
  itemDesbloqueadoText: {
    fontSize: 24,
    color: colors.success,
    fontWeight: 'bold',
  },
  itemEstado: {
    fontSize: 12,
    color: colors.success,
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'right',
  },
});

