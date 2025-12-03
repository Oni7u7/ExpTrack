import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../config/colors';
import { getGastos, getGastosByDateRange } from '../services/gastosService';
import { getAllLimites } from '../services/limitesService';
import { getRecompensas } from '../services/recompensasService';
import { getCategorias } from '../services/categoriasService';

// Función auxiliar para formatear fecha
const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

export default function ChatbotTab({ userId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '¡Hola! Soy tu asistente de gastos inteligente. Puedo ayudarte con:\n\n• Consultar tus gastos y estadísticas\n• Revisar tus límites\n• Ver tus recompensas\n• Darte consejos personalizados\n• Analizar tus patrones de gasto\n\n¿En qué puedo ayudarte?',
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Desplazar al final cuando se agregan nuevos mensajes
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = inputText;
    setInputText('');
    setIsTyping(true);

    // Procesar la pregunta del usuario
    const response = await processMessage(userInput.toLowerCase());
    
    setIsTyping(false);
    
    const botMessage = {
      id: Date.now() + 1,
      text: response,
      isUser: false,
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, botMessage]);
    }, 300);
  };

  const handleQuickAction = (action) => {
    setInputText(action);
    handleSend();
  };

  const processMessage = async (message) => {
    // Gastos
    if (message.includes('gastos') || message.includes('gasto') || message.includes('cuánto gasté') || message.includes('cuanto gaste')) {
      const { data: gastos } = await getGastos(userId);
      if (!gastos || gastos.length === 0) {
        return 'No tienes gastos registrados aún.\n\nPuedes agregar uno desde la pestaña "Gastos" o usando el botón + en el tabbar.';
      }
      
      const total = gastos.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0);
      const ultimoGasto = gastos[0];
      const promedio = total / gastos.length;
      
      // Análisis por categoría
      const gastosPorCategoria = {};
      gastos.forEach(g => {
        const cat = g.categorias?.nombre || 'Sin categoría';
        gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + parseFloat(g.monto || 0);
      });
      
      const categoriaTop = Object.entries(gastosPorCategoria)
        .sort((a, b) => b[1] - a[1])[0];
      
      let respuesta = `Resumen de tus gastos:\n\n`;
      respuesta += `• Total: ${formatCurrency(total)}\n`;
      respuesta += `• Cantidad: ${gastos.length} gasto(s)\n`;
      respuesta += `• Promedio: ${formatCurrency(promedio)}\n\n`;
      
      if (categoriaTop) {
        respuesta += `Categoría más gastada:\n${categoriaTop[0]}: ${formatCurrency(categoriaTop[1])}\n\n`;
      }
      
      respuesta += `Último gasto:\n${formatCurrency(ultimoGasto.monto)} - ${ultimoGasto.descripcion || 'Sin descripción'}`;
      
      return respuesta;
    }

    // Límites
    if (message.includes('límite') || message.includes('limite') || message.includes('presupuesto')) {
      const { data: limites } = await getAllLimites(userId);
      if (!limites || limites.length === 0) {
        return 'No tienes límites establecidos actualmente.\n\nPuedes crear uno desde la pestaña "Límite" para controlar mejor tus gastos.';
      }
      
      const limiteActivo = limites.find(l => {
        const hoy = formatDateLocal(new Date());
        return l.fecha_inicio <= hoy && l.fecha_fin >= hoy;
      });
      
      if (limiteActivo) {
        const porcentaje = ((limiteActivo.gasto_total || 0) / limiteActivo.monto_limite) * 100;
        const restante = limiteActivo.monto_limite - (limiteActivo.gasto_total || 0);
        const estado = porcentaje > 100 ? 'Excedido' : porcentaje > 80 ? 'Cuidado' : 'Bien';
        
        let respuesta = `Tu límite actual:\n\n`;
        respuesta += `• Monto: ${formatCurrency(limiteActivo.monto_limite)}\n`;
        respuesta += `• Gastado: ${formatCurrency(limiteActivo.gasto_total || 0)} (${porcentaje.toFixed(1)}%)\n`;
        respuesta += `• Restante: ${formatCurrency(restante)}\n`;
        respuesta += `• Estado: ${estado}\n\n`;
        
        if (porcentaje > 100) {
          respuesta += `Has excedido tu límite. Te recomiendo revisar tus gastos.`;
        } else if (porcentaje > 80) {
          respuesta += `Estás cerca del límite. Ten cuidado con los próximos gastos.`;
        } else {
          respuesta += `Vas bien. Sigue así.`;
        }
        
        return respuesta;
      } else {
        return `Tienes ${limites.length} límite(s) registrado(s), pero ninguno está activo actualmente.\n\nPuedes crear un nuevo límite desde la pestaña "Límite".`;
      }
    }

    // Recompensas
    if (message.includes('recompensa') || message.includes('puntos') || message.includes('logros')) {
      const { data: recompensas } = await getRecompensas(userId);
      if (!recompensas || recompensas.length === 0) {
        return 'No tienes recompensas aún.\n\n¡Mantén el control de tus gastos y cumple con tus límites para obtener recompensas!';
      }
      
      const puntosTotales = recompensas.reduce((sum, r) => sum + (r.puntos || 0), 0);
      const ultimaRecompensa = recompensas[0];
      
      let respuesta = `Tus recompensas:\n\n`;
      respuesta += `• Puntos totales: ${puntosTotales} pts\n`;
      respuesta += `• Recompensas obtenidas: ${recompensas.length}\n\n`;
      respuesta += `Última recompensa:\n${ultimaRecompensa.titulo || 'Recompensa'}\n`;
      respuesta += `${ultimaRecompensa.puntos || 0} puntos\n`;
      if (ultimaRecompensa.descripcion) {
        respuesta += `${ultimaRecompensa.descripcion}`;
      }
      
      return respuesta;
    }

    // Análisis y estadísticas
    if (message.includes('análisis') || message.includes('analisis') || message.includes('estadística') || message.includes('estadistica') || message.includes('resumen')) {
      const { data: gastos } = await getGastos(userId);
      if (!gastos || gastos.length === 0) {
        return 'No hay datos suficientes para hacer un análisis.\n\nAgrega algunos gastos primero.';
      }
      
      const hoy = new Date();
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const { data: gastosMes } = await getGastosByDateRange(
        userId,
        formatDateLocal(primerDiaMes),
        formatDateLocal(hoy)
      );
      
      const totalMes = gastosMes?.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0) || 0;
      const totalGeneral = gastos.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0);
      
      // Análisis por categoría
      const gastosPorCategoria = {};
      gastos.forEach(g => {
        const cat = g.categorias?.nombre || 'Sin categoría';
        gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + parseFloat(g.monto || 0);
      });
      
      const categoriasOrdenadas = Object.entries(gastosPorCategoria)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      let respuesta = `Análisis de tus gastos:\n\n`;
      respuesta += `Este mes:\n${formatCurrency(totalMes)}\n\n`;
      respuesta += `Total general:\n${formatCurrency(totalGeneral)}\n\n`;
      respuesta += `Top 3 categorías:\n`;
      categoriasOrdenadas.forEach(([cat, monto], index) => {
        const porcentaje = (monto / totalGeneral) * 100;
        respuesta += `${index + 1}. ${cat}: ${formatCurrency(monto)} (${porcentaje.toFixed(1)}%)\n`;
      });
      
      return respuesta;
    }

    // Consejos personalizados
    if (message.includes('consejo') || message.includes('ahorro') || message.includes('recomendación') || message.includes('recomendacion')) {
      const { data: limites } = await getAllLimites(userId);
      const limiteActivo = limites?.find(l => {
        const hoy = formatDateLocal(new Date());
        return l.fecha_inicio <= hoy && l.fecha_fin >= hoy;
      });
      
      let consejos = 'Consejos personalizados:\n\n';
      
      if (limiteActivo) {
        const porcentaje = ((limiteActivo.gasto_total || 0) / limiteActivo.monto_limite) * 100;
        if (porcentaje > 90) {
          consejos += 'Estás muy cerca de tu límite. Considera:\n';
          consejos += '• Revisar gastos no esenciales\n';
          consejos += '• Posponer compras grandes\n';
          consejos += '• Buscar alternativas más económicas\n\n';
        }
      }
      
      consejos += 'Consejos generales:\n';
      consejos += '1. Establece límites mensuales\n';
      consejos += '2. Revisa tus gastos semanalmente\n';
      consejos += '3. Categoriza tus gastos\n';
      consejos += '4. Evita compras impulsivas\n';
      consejos += '5. Compara precios antes de comprar\n';
      consejos += '6. Usa la regla 24 horas para compras grandes\n';
      consejos += '7. Ahorra al menos el 10% de tus ingresos\n\n';
      consejos += '¡Cada pequeño ahorro cuenta!';
      
      return consejos;
    }

    // Ayuda
    if (message.includes('ayuda') || message.includes('help') || message.includes('comandos') || message.includes('qué puedo') || message.includes('que puedo')) {
      return 'Comandos disponibles:\n\n'
        + 'Gastos:\n'
        + '• "gastos" o "cuánto gasté"\n'
        + '• "análisis" o "estadísticas"\n\n'
        + 'Límites:\n'
        + '• "límite" o "presupuesto"\n\n'
        + 'Recompensas:\n'
        + '• "recompensas" o "puntos"\n\n'
        + 'Consejos:\n'
        + '• "consejos" o "recomendaciones"\n\n'
        + 'Puedes preguntarme en lenguaje natural. ¡Inténtalo!';
    }

    // Saludo
    if (message.includes('hola') || message.includes('hi') || message.includes('buenos días') || message.includes('buenas tardes')) {
      return '¡Hola! ¿En qué puedo ayudarte hoy?\n\nPuedes preguntarme sobre tus gastos, límites, recompensas o pedirme consejos.';
    }

    // Respuesta por defecto con sugerencias
    return 'No estoy seguro de cómo ayudarte con eso.\n\n'
      + 'Puedes preguntarme sobre:\n'
      + '• Tus gastos y estadísticas\n'
      + '• Tus límites\n'
      + '• Tus recompensas\n'
      + '• Consejos de ahorro\n\n'
      + 'Escribe "ayuda" para ver todos los comandos disponibles.';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Asistente de Gastos</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.message,
              message.isUser ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : styles.botMessageText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}
        {isTyping && (
          <View style={[styles.message, styles.botMessage]}>
            <ActivityIndicator size="small" color={colors.textSecondary} />
            <Text style={[styles.messageText, styles.botMessageText]}> Escribiendo...</Text>
          </View>
        )}
      </ScrollView>

      {/* Botones de acción rápida */}
      <View style={styles.quickActions}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('gastos')}
          >
            <Text style={styles.quickActionText}>Gastos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('límite')}
          >
            <Text style={styles.quickActionText}>Límite</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('recompensas')}
          >
            <Text style={styles.quickActionText}>Recompensas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('análisis')}
          >
            <Text style={styles.quickActionText}>Análisis</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('consejos')}
          >
            <Text style={styles.quickActionText}>Consejos</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu mensaje..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.sendButtonDisabled]} 
          onPress={handleSend}
          disabled={!inputText.trim() || isTyping}
        >
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.buttonPrimary,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.buttonPrimaryText,
  },
  botMessageText: {
    color: colors.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 30,
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.textPrimary,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textTertiary,
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.buttonPrimaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickActionButton: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
});

