import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { logoutUser } from '../services/authService';
import { colors } from '../config/colors';
import HistorialTab from '../components/HistorialTab';
import GastosTab from '../components/GastosTab';
import ChatbotTab from '../components/ChatbotTab';

export default function HomeScreen({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('Home');

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

  const renderContent = () => {
    if (activeTab === 'Historial') {
      return <HistorialTab key={activeTab} userId={user?.id} />;
    }

    if (activeTab === 'Gastos') {
      return <GastosTab userId={user?.id} />;
    }

    if (activeTab === 'Chatbot') {
      return <ChatbotTab userId={user?.id} />;
    }

    if (activeTab === 'Perfil') {
      return (
        <View style={styles.content} contentContainerStyle={styles.profileContent}>
          
          
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
        </View>
      );
    }

    // Contenido por defecto (Home)
    return (
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenido a ExpTrack</Text>
        <Text style={styles.subtitle}>Hola, {user?.nombre || 'Usuario'}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const tabs = ['Home', 'Historial', 'Perfil', 'Gastos', 'Chatbot'];

  return (
    <View style={styles.container}>
      {renderContent()}

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    height: 60,
    backgroundColor: colors.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 5,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: colors.tabActive,
  },
  tabText: {
    fontSize: 12,
    color: colors.tabInactive,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.tabActive,
    fontWeight: '600',
  },
});


