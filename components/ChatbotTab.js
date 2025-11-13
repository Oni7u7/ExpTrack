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
} from 'react-native';
import { colors } from '../config/colors';
import { getGastos } from '../services/gastosService';
import { getLimiteActual } from '../services/limitesService';

export default function ChatbotTab({ userId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '¡Hola! Soy tu asistente de gastos. Puedo ayudarte a revisar tus gastos, límites y darte consejos. ¿En qué puedo ayudarte?',
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Desplazar al final cuando se agregan nuevos mensajes
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Procesar la pregunta del usuario
    const response = await processMessage(inputText.toLowerCase());
    
    const botMessage = {
      id: Date.now() + 1,
      text: response,
      isUser: false,
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  const processMessage = async (message) => {
    // Comandos simples para el chatbot
    if (message.includes('gastos') || message.includes('gasto')) {
      const { data: gastos } = await getGastos(userId);
      if (!gastos || gastos.length === 0) {
        return 'No tienes gastos registrados aún. Puedes agregar uno desde la pestaña "Gastos".';
      }
      
      const total = gastos.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0);
      const ultimoGasto = gastos[0];
      
      return `Tienes ${gastos.length} gasto(s) registrado(s).\n\nTotal gastado: $${total.toFixed(2)}\n\nÚltimo gasto: $${ultimoGasto.monto.toFixed(2)} - ${ultimoGasto.descripcion || 'Sin descripción'}`;
    }

    if (message.includes('límite') || message.includes('limite')) {
      const { data: limite } = await getLimiteActual(userId);
      if (!limite) {
        return 'No tienes un límite establecido actualmente.';
      }
      
      const porcentaje = ((limite.gasto_total || 0) / limite.monto_limite) * 100;
      const restante = limite.monto_limite - (limite.gasto_total || 0);
      
      return `Tu límite actual es de $${limite.monto_limite.toFixed(2)}.\n\nHas gastado: $${(limite.gasto_total || 0).toFixed(2)} (${porcentaje.toFixed(1)}%)\n\nTe quedan: $${restante.toFixed(2)}`;
    }

    if (message.includes('ayuda') || message.includes('help')) {
      return 'Puedo ayudarte con:\n\n• Consultar tus gastos\n• Revisar tu límite de gastos\n• Darte consejos sobre ahorro\n\nSolo pregúntame en lenguaje natural.';
    }

    if (message.includes('consejo') || message.includes('ahorro')) {
      return '💡 Consejos de ahorro:\n\n1. Establece un límite mensual y respétalo\n2. Revisa tus gastos regularmente\n3. Categoriza tus gastos para identificar patrones\n4. Evita gastos impulsivos\n5. Compara precios antes de comprar\n\n¡Cada pequeño ahorro cuenta!';
    }

    // Respuesta por defecto
    return 'No estoy seguro de cómo ayudarte con eso. Puedes preguntarme sobre:\n\n• Tus gastos\n• Tu límite de gastos\n• Consejos de ahorro\n\nO escribe "ayuda" para más información.';
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
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu mensaje..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
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
  sendButtonText: {
    color: colors.buttonPrimaryText,
    fontSize: 16,
    fontWeight: '600',
  },
});

