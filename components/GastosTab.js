import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { addGasto } from '../services/gastosService';
import { getLimiteActual } from '../services/limitesService';
import { getCategorias, addCategoria } from '../services/categoriasService';
import { colors } from '../config/colors';

// Categorías predefinidas
const CATEGORIAS_PREDEFINIDAS = [
  { id: 'comida', nombre: 'Comida' },
  { id: 'transporte', nombre: 'Transporte' },
  { id: 'entretenimiento', nombre: 'Entretenimiento' },
  { id: 'servicios', nombre: 'Servicios' },
  { id: 'salud', nombre: 'Salud' },
];

export default function GastosTab({ userId }) {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [limite, setLimite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoriasMap, setCategoriasMap] = useState({});

  useEffect(() => {
    loadLimite();
    initializeCategorias();
  }, [userId]);

  // Inicializar categorías en la base de datos
  const initializeCategorias = async () => {
    try {
      // Obtener todas las categorías existentes
      const { data: categoriasExistentes } = await getCategorias();
      const map = {};
      
      // Mapear categorías existentes por nombre
      if (categoriasExistentes) {
        categoriasExistentes.forEach(cat => {
          map[cat.nombre.toLowerCase()] = cat.id;
        });
      }

      // Crear las categorías predefinidas si no existen
      for (const cat of CATEGORIAS_PREDEFINIDAS) {
        const nombreLower = cat.nombre.toLowerCase();
        if (!map[nombreLower]) {
          const { data: nuevaCategoria } = await addCategoria(cat.nombre, null);
          if (nuevaCategoria) {
            map[nombreLower] = nuevaCategoria.id;
          }
        }
      }

      setCategoriasMap(map);
    } catch (error) {
      console.error('Error al inicializar categorías:', error);
    }
  };

  const loadLimite = async () => {
    const { data } = await getLimiteActual(userId);
    setLimite(data);
  };

  const handleSubmit = async () => {
    if (!monto || parseFloat(monto) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    
    // Asegurar que las categorías estén inicializadas
    if (Object.keys(categoriasMap).length === 0) {
      await initializeCategorias();
    }
    
    // Obtener el ID real de la categoría desde el mapa
    let categoriaIdParaBD = null;
    if (categoriaId) {
      if (typeof categoriaId === 'string') {
        // Es una categoría predefinida, buscar su ID en el mapa
        const categoria = CATEGORIAS_PREDEFINIDAS.find(c => c.id === categoriaId);
        if (categoria) {
          const nombreLower = categoria.nombre.toLowerCase();
          categoriaIdParaBD = categoriasMap[nombreLower] || null;
          
          // Si no está en el mapa, intentar crearla
          if (!categoriaIdParaBD) {
            const { data: nuevaCategoria } = await addCategoria(categoria.nombre, null);
            if (nuevaCategoria) {
              categoriaIdParaBD = nuevaCategoria.id;
              setCategoriasMap(prev => ({
                ...prev,
                [nombreLower]: nuevaCategoria.id
              }));
            }
          }
        }
      } else {
        // Ya es un ID numérico
        categoriaIdParaBD = categoriaId;
      }
    }

    const { data, error } = await addGasto(
      userId,
      categoriaIdParaBD,
      monto,
      descripcion,
      fecha
    );

    setLoading(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert('Éxito', 'Gasto agregado correctamente', [
        {
          text: 'OK',
          onPress: () => {
            setMonto('');
            setDescripcion('');
            setCategoriaId(null);
            setFecha(new Date().toISOString().split('T')[0]);
            setShowModal(false);
          },
        },
      ]);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Agregar Gasto</Text>

        {limite && (
          <View style={styles.limiteCard}>
            <Text style={styles.limiteTitle}>Límite Actual</Text>
            <Text style={styles.limiteMonto}>{formatCurrency(limite.monto_limite)}</Text>
            <Text style={styles.limiteGasto}>
              Gastado: {formatCurrency(limite.gasto_total || 0)}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      ((limite.gasto_total || 0) / limite.monto_limite) * 100,
                      100
                    )}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.addButtonText}>+ Agregar Nuevo Gasto</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>Nuevo Gasto</Text>

              <Text style={styles.label}>Monto *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={monto}
                onChangeText={setMonto}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Categoría</Text>
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={styles.categoryButtonText}>
                  {categoriaId
                    ? CATEGORIAS_PREDEFINIDAS.find(c => c.id === categoriaId)?.nombre || 'Sin categoría'
                    : 'Sin categoría'}
                </Text>
                <Text style={styles.categoryButtonArrow}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descripción del gasto"
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Fecha</Text>
              <TextInput
                style={styles.input}
                value={fecha}
                onChangeText={setFecha}
                placeholder="YYYY-MM-DD"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Guardando...' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar categoría */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.categoryModalOverlay}>
          <TouchableOpacity
            style={styles.categoryModalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCategoryModal(false)}
          />
          <View style={styles.categoryModalContent}>
            <Text style={styles.categoryModalTitle}>Seleccionar Categoría</Text>
            <ScrollView
              showsVerticalScrollIndicator={true}
              style={styles.categoryModalScroll}
            >
              <TouchableOpacity
                style={[
                  styles.categoryOption,
                  !categoriaId && styles.categoryOptionSelected
                ]}
                onPress={() => {
                  setCategoriaId(null);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={[
                  styles.categoryOptionText,
                  !categoriaId && styles.categoryOptionTextSelected
                ]}>
                  Sin categoría
                </Text>
              </TouchableOpacity>
              {CATEGORIAS_PREDEFINIDAS.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    categoriaId === cat.id && styles.categoryOptionSelected
                  ]}
                  onPress={() => {
                    setCategoriaId(cat.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    categoriaId === cat.id && styles.categoryOptionTextSelected
                  ]}>
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
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
  limiteCard: {
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
  limiteTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  limiteMonto: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  limiteGasto: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    width: '100%',
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.textPrimary,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryButton: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  categoryButtonText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  categoryButtonArrow: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  categoryModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  categoryModalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    width: '80%',
    maxWidth: 400,
    maxHeight: '70%',
    padding: 20,
    shadowColor: colors['900'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  categoryModalScroll: {
    maxHeight: 300,
  },
  categoryModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryOption: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  categoryOptionSelected: {
    backgroundColor: colors.primary,
  },
  categoryOptionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  categoryOptionTextSelected: {
    color: colors.buttonPrimaryText,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
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

