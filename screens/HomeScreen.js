import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, Animated, RefreshControl } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { logoutUser } from '../services/authService';
import { colors } from '../config/colors';
import HistorialTab from '../components/HistorialTab';
import ChatbotTab from '../components/ChatbotTab';
import HomeTab from '../components/HomeTab';
import LimiteTab from '../components/LimiteTab';
import RecompensasTab from '../components/RecompensasTab';
import AddGastoModal from '../components/AddGastoModal';
import { getRecompensas } from '../services/recompensasService';

export default function HomeScreen({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('Home');
  const [showAddGastoModal, setShowAddGastoModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [avatarDesbloqueado, setAvatarDesbloqueado] = useState(false);
  const [avatarSeleccionado, setAvatarSeleccionado] = useState(null);
  const [refreshingProfile, setRefreshingProfile] = useState(false);
  const avatarSeleccionadoRef = useRef(null);
  
  // Referencias para las posiciones de los tabs
  const tabPositions = useRef({});
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  // Referencias para las animaciones de escala de los iconos
  const iconScales = useRef({});

  // Mapeo de IDs de avatares a sus imágenes
  const avatarImages = {
    'avatar_bajo_btr': require('../assets/images/bajo-btr.png'),
    'avatar_miku-terr': require('../assets/images/miku-terr.png'),
    'avatar_ellen-joe': require('../assets/images/ellen-zzz.png'),
    'avatar_GI': require('../assets/images/gi.jpeg'),
    'avatar_Yuji': require('../assets/images/yuji.jpeg'),
    'avatar_ellen Chibi': require('../assets/images/elenchibi.jpeg'),
  };

  // Verificar si el usuario tiene avatares desbloqueados y cuál está seleccionado
  useEffect(() => {
    const checkAvatar = async () => {
      if (user?.id) {
        const { data: recompensas } = await getRecompensas(user.id);
        if (recompensas) {
          // Buscar todos los avatares desbloqueados (cualquier recompensa que empiece con "desbloqueo_avatar_")
          const avataresDesbloqueados = recompensas
            .filter(r => r.semana?.startsWith('desbloqueo_avatar_'))
            .map(r => r.semana.replace('desbloqueo_', ''));
          
          const tieneAvatar = avataresDesbloqueados.length > 0;
          setAvatarDesbloqueado(tieneAvatar);

          // Usar el ref para obtener el valor actual del avatar seleccionado
          const avatarActual = avatarSeleccionadoRef.current;

          // Si hay avatares desbloqueados
          if (avataresDesbloqueados.length > 0) {
            // Si hay un avatar seleccionado y está en la lista de desbloqueados, mantenerlo
            // Si no, usar el primero disponible
            if (avatarActual && avataresDesbloqueados.includes(avatarActual)) {
              setAvatarSeleccionado(avatarActual);
              avatarSeleccionadoRef.current = avatarActual;
            } else {
              const primerDesbloqueado = avataresDesbloqueados[0];
              setAvatarSeleccionado(primerDesbloqueado);
              avatarSeleccionadoRef.current = primerDesbloqueado;
            }
          } else {
            // Si no hay avatares desbloqueados, limpiar la selección
            setAvatarSeleccionado(null);
            avatarSeleccionadoRef.current = null;
          }
        }
      }
    };
    checkAvatar();
  }, [user?.id, refreshKey]);

  // Función para actualizar cuando se compre o seleccione un avatar
  const handleAvatarUpdated = (avatarId = null) => {
    if (avatarId) {
      // Actualizar estado inmediatamente y refrescar para asegurar que se muestre
      setAvatarSeleccionado(avatarId);
      avatarSeleccionadoRef.current = avatarId;
      setAvatarDesbloqueado(true);
      setRefreshKey(prev => prev + 1);
    } else {
      // Si no se pasa avatarId, solo refrescar (cuando se compra un avatar)
      setRefreshKey(prev => prev + 1);
    }
  };

  // Función para manejar el refresh del perfil
  const onRefreshProfile = async () => {
    setRefreshingProfile(true);
    // Actualizar refreshKey para forzar la recarga de avatares
    setRefreshKey(prev => prev + 1);
    // Esperar un momento para que se complete la actualización
    setTimeout(() => {
      setRefreshingProfile(false);
    }, 500);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logoutUser();
            onLogout();
          },
        },
      ]
    );
  };

  const handleGastoAdded = () => {
    // Forzar actualización de los tabs que necesitan recargarse
    setRefreshKey(prev => prev + 1);
  };

  const renderContent = () => {
    if (activeTab === 'Home') {
      return <HomeTab key={`${activeTab}-${refreshKey}`} userId={user?.id} />;
    }

    if (activeTab === 'Historial') {
      return <HistorialTab key={`${activeTab}-${refreshKey}`} userId={user?.id} />;
    }

    if (activeTab === 'Límite') {
      return <LimiteTab key={`${activeTab}-${refreshKey}`} userId={user?.id} />;
    }

    if (activeTab === 'Recompensas') {
      return <RecompensasTab key={`${activeTab}-${refreshKey}`} userId={user?.id} onAvatarUpdated={handleAvatarUpdated} avatarSeleccionado={avatarSeleccionado} />;
    }

    if (activeTab === 'Chatbot') {
      return <ChatbotTab userId={user?.id} />;
    }

    if (activeTab === 'Perfil') {
      // Obtener iniciales del nombre
      const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
          return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      };

      // Generar color basado en el nombre del usuario (sin modificar BD)
      const getAvatarColor = (name) => {
        if (!name) return colors.buttonPrimary;
        const colorsList = [
          '#5B715B', // Verde principal
          '#768B77', // Verde claro
          '#48594A', // Verde oscuro
          '#9DAF9D', // Verde medio claro
          '#3C493D', // Verde muy oscuro
          '#5B7A8C', // Azul verdoso
          '#7A8B6B', // Verde oliva
          '#6B8B7A', // Verde azulado
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
          hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colorsList[Math.abs(hash) % colorsList.length];
      };

      const avatarColor = getAvatarColor(user?.nombre);

      return (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.profileContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshingProfile}
              onRefresh={onRefreshProfile}
              tintColor={colors.buttonPrimary}
            />
          }
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
                {avatarDesbloqueado && avatarSeleccionado && avatarImages[avatarSeleccionado] ? (
                  <Image 
                    source={avatarImages[avatarSeleccionado]} 
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.avatarText}>{getInitials(user?.nombre)}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.profileField}>
              <Text style={styles.profileLabel}>Nombre</Text>
              <Text style={styles.profileValue}>{user?.nombre || 'No disponible'}</Text>
            </View>

            <View style={styles.profileField}>
              <Text style={styles.profileLabel}>Correo Electrónico</Text>
              <Text style={styles.profileValue}>{user?.email || 'No disponible'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    return null;
  };

  const tabs = ['Home', 'Historial', 'Límite', 'Recompensas', 'Perfil', 'Chatbot'];
  
  // Función para guardar la posición de un tab
  const saveTabPosition = (tabName, x, width) => {
    tabPositions.current[tabName] = {
      x: x + width / 2 - 20, // Centrar el indicador (ancho del indicador es 40, así que -20)
      width: width,
    };
    
    // Si es el tab activo, animar inmediatamente
    if (tabName === activeTab) {
      animateIndicator(tabName);
    }
  };
  
  // Función para animar el indicador cuando cambia el tab
  const animateIndicator = (tabName) => {
    const position = tabPositions.current[tabName];
    if (position) {
      Animated.timing(indicatorPosition, {
        toValue: position.x,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };
  
  // Efecto para animar el indicador cuando cambia el tab activo
  useEffect(() => {
    animateIndicator(activeTab);
  }, [activeTab]);
  
  // Función para obtener o crear la animación de escala para un tab
  const getIconScale = (tabName) => {
    if (!iconScales.current[tabName]) {
      iconScales.current[tabName] = new Animated.Value(1);
    }
    return iconScales.current[tabName];
  };

  // Función para animar el cambio de tamaño del icono
  const animateIconScale = (tabName, isActive) => {
    const scale = getIconScale(tabName);
    Animated.spring(scale, {
      toValue: isActive ? 1.2 : 1,
      tension: 150,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  // Efecto para animar los iconos cuando cambia el tab activo
  useEffect(() => {
    tabs.forEach((tab) => {
      const isActive = activeTab === tab;
      animateIconScale(tab, isActive);
    });
  }, [activeTab]);

  // Función para manejar el cambio de tab
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // Función para renderizar iconos SVG
  const renderIcon = (tabName, isActive) => {
    const iconColor = isActive ? colors.tabActive : colors.tabInactive;
    const iconSize = isActive ? 34 : 28;

    switch (tabName) {
      case 'Home':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'Historial':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'Límite':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 8V12L14 14"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'Recompensas':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <Path
              d="M11.049 2.927C11.349 2.006 12.651 2.006 12.951 2.927L14.469 7.601C14.603 8.012 14.987 8.291 15.42 8.291H20.335C21.304 8.291 21.706 9.531 20.923 10.101L17.029 12.948C16.693 13.188 16.554 13.618 16.688 14.029L18.206 18.703C18.506 19.624 17.451 20.369 16.668 19.799L12.774 16.952C12.438 16.712 11.562 16.712 11.226 16.952L7.332 19.799C6.549 20.369 5.494 19.624 5.794 18.703L7.312 14.029C7.446 13.618 7.307 13.188 6.971 12.948L3.077 10.101C2.294 9.531 2.696 8.291 3.665 8.291H8.58C9.013 8.291 9.397 8.012 9.531 7.601L11.049 2.927Z"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'Perfil':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'Chatbot':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <Path
              d="M8 10H8.01M12 10H12.01M16 10H16.01M21 12C21 16.9706 16.9706 21 12 21C10.4601 21 9.02172 20.6335 7.74571 19.9765L3 21L4.02353 16.2543C3.36652 14.9783 3 13.5399 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}

      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.indicator,
            {
              transform: [{ translateX: indicatorPosition }],
            },
          ]}
        />
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab;
          // Colocar el botón circular en el centro (después de Límite, antes de Recompensas)
          const centerIndex = Math.floor(tabs.length / 2) - 1; // Índice 2 (Límite)
          
          // Si estamos en el índice antes del centro, agregar el botón circular después de este tab
          if (index === centerIndex) {
            return (
              <React.Fragment key={`fragment-${tab}`}>
                <TouchableOpacity
                  key={tab}
                  style={styles.tab}
                  onPress={() => handleTabChange(tab)}
                  onLayout={(event) => {
                    const { x, width } = event.nativeEvent.layout;
                    saveTabPosition(tab, x, width);
                  }}
                >
                  <Animated.View
                    style={{
                      transform: [{ scale: getIconScale(tab) }],
                    }}
                  >
                    {renderIcon(tab, isActive)}
                  </Animated.View>
                </TouchableOpacity>
                {/* Botón circular para agregar gasto */}
                <TouchableOpacity
                  style={styles.addButtonCircle}
                  onPress={() => setShowAddGastoModal(true)}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </React.Fragment>
            );
          }
          
          return (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => handleTabChange(tab)}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                saveTabPosition(tab, x, width);
              }}
            >
              <Animated.View
                style={{
                  transform: [{ scale: getIconScale(tab) }],
                }}
              >
                {renderIcon(tab, isActive)}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>

      <AddGastoModal
        userId={user?.id}
        visible={showAddGastoModal}
        onClose={() => setShowAddGastoModal(false)}
        onGastoAdded={handleGastoAdded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    top: 60,
    flex: 1,
    padding: 20,
  },
  profileContent: {
    paddingBottom: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: -50,
    paddingTop: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.cardBackground,
    shadowColor: colors['900'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.buttonPrimaryText,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  profileTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: colors.textPrimary,
    textAlign: 'center',
    top: 20,
  },
  profileCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: colors.border,
    top: 60,
    shadowColor: colors['900'],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileField: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  profileFieldLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileValue: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: colors.textTertiary,
    marginBottom: 40,
    textAlign: 'center',
  },
  logoutButton: {
    width: '100%',
    maxWidth: 350,
    height: 50,
    backgroundColor: colors.buttonPrimary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 60,
  },
  logoutButtonText: {
    color: colors.buttonDangerText,
    fontSize: 16,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: colors.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 10,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 3,
    backgroundColor: colors.tabActive,
    borderRadius: 2,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    minWidth: 0,
  },
  addButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -8,
    marginHorizontal: 4,
    shadowColor: colors['900'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.cardBackground,
    flexShrink: 0,
  },
  addButtonText: {
    fontSize: 32,
    color: colors.buttonPrimaryText,
    fontWeight: '300',
    lineHeight: 32,
  },
});


