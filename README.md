# 📱 ExpTrack

Una aplicación móvil desarrollada con React Native y Expo para el seguimiento y control de gastos personales. ExpTrack te ayuda a gestionar tus finanzas de manera eficiente con un sistema de límites, categorías, recompensas y análisis detallados.

## ✨ Características Principales

### 💰 Gestión de Gastos
- **Registro de gastos**: Agrega gastos con monto, descripción, categoría y fecha
- **Categorización**: Organiza tus gastos en categorías predefinidas (Comida, Transporte, Entretenimiento, Servicios, Salud)
- **Historial completo**: Visualiza todos tus gastos con filtros y búsqueda

### 📊 Análisis y Estadísticas
- **Resumen de gastos**: Total gastado, promedio por gasto y cantidad de gastos
- **Gráficas interactivas**:
  - Gráfica de pastel por categoría
  - Gráfica de barras por mes (últimos 6 meses)
  - Gráfica de línea de tendencia diaria (últimos 7 días)

### 🎯 Sistema de Límites
- **Límites personalizados**: Establece límites de gasto por período
- **Seguimiento en tiempo real**: Monitorea tu progreso hacia el límite
- **Alertas**: Notificaciones cuando te acercas o excedes tu límite

### 🏆 Sistema de Recompensas
- **Puntos por cumplimiento**: Gana puntos al cumplir con tus límites
- **Tienda de avatares**: Canjea puntos por avatares personalizados
- **Selección de avatar**: Elige entre múltiples avatares desbloqueados para tu perfil

### 🤖 Asistente Inteligente
- **Chatbot integrado**: Consulta tus gastos, límites y recompensas mediante lenguaje natural
- **Análisis personalizado**: Obtén consejos y recomendaciones basados en tus hábitos de gasto
- **Comandos rápidos**: Acceso rápido a información importante

### 🎨 Interfaz Moderna
- **Diseño intuitivo**: Navegación por tabs con animaciones suaves
- **Tema personalizable**: Colores y estilos adaptables
- **Animaciones fluidas**: Transiciones y efectos visuales mejorados

## 🛠️ Tecnologías Utilizadas

- **React Native** (0.81.5) - Framework para desarrollo móvil multiplataforma
- **Expo** (~54.0.23) - Plataforma para desarrollo React Native
- **Supabase** - Backend como servicio (BaaS) para base de datos y autenticación
- **React Native SVG** - Gráficos y visualizaciones personalizadas
- **React Native Chart Kit** - Componentes de gráficas

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- npm o yarn
- Cuenta de Expo
- Proyecto de Supabase configurado

## 🚀 Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/Oni7u7/ExpTrack.git
   cd ExpTrack
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura Supabase**
   - Crea un proyecto en [Supabase](https://supabase.com)
   - Ejecuta el script SQL en `setup_database.sql` en tu base de datos
   - Configura las variables de entorno en `config/supabase.js`

4. **Inicia la aplicación**
   ```bash
   npm start
   ```

## ⚙️ Configuración

### Configuración de Supabase

1. Edita `config/supabase.js` con tus credenciales:
   ```javascript
   export const supabaseUrl = 'TU_SUPABASE_URL';
   export const supabaseAnonKey = 'TU_SUPABASE_ANON_KEY';
   ```

2. Ejecuta el script de configuración de la base de datos:
   ```sql
   -- Ver setup_database.sql para el esquema completo
   ```

### Configuración de Colores

Personaliza los colores de la aplicación editando `config/colors.js`:
```javascript
export const colors = {
  primary: '#5B715B',
  background: '#FFFFFF',
  // ... más colores
};
```

## 📁 Estructura del Proyecto

```
ExpTrack/
├── assets/              # Imágenes y recursos
│   ├── images/         # Avatares y logos
│   └── ...
├── components/          # Componentes reutilizables
│   ├── AddGastoModal.js
│   ├── ChatbotTab.js
│   ├── GastosTab.js
│   ├── HistorialTab.js
│   ├── HomeTab.js
│   ├── LimiteTab.js
│   └── RecompensasTab.js
├── config/             # Configuraciones
│   ├── colors.js
│   └── supabase.js
├── screens/            # Pantallas principales
│   ├── HomeScreen.js
│   ├── LoginScreen.js
│   └── RegisterScreen.js
├── services/           # Servicios de API
│   ├── authService.js
│   ├── categoriasService.js
│   ├── gastosService.js
│   ├── limitesService.js
│   └── recompensasService.js
├── App.js              # Componente principal
└── package.json        # Dependencias del proyecto
```

## 🎮 Uso

### Registro e Inicio de Sesión
1. Crea una cuenta nueva o inicia sesión con tus credenciales
2. Completa tu perfil con nombre y correo electrónico

### Agregar Gastos
1. Toca el botón **+** en la barra de navegación
2. Completa el formulario:
   - Monto del gasto
   - Categoría (obligatoria)
   - Descripción (opcional)
   - Fecha
3. Guarda el gasto

### Establecer Límites
1. Ve a la pestaña **Límite**
2. Configura un nuevo límite con:
   - Monto máximo
   - Fecha de inicio y fin
3. Monitorea tu progreso en tiempo real

### Ver Estadísticas
1. En la pestaña **Home** encontrarás:
   - Resumen de gastos totales
   - Gráficas por categoría, mes y día
   - Promedio de gastos

### Sistema de Recompensas
1. Cumple con tus límites para ganar puntos
2. Ve a la pestaña **Recompensas**
3. Cambia a **Tienda** para desbloquear avatares
4. Selecciona tu avatar favorito

### Usar el Chatbot
1. Ve a la pestaña **Chatbot**
2. Haz preguntas como:
   - "¿Cuánto gasté?"
   - "Muéstrame mi límite"
   - "Dame consejos de ahorro"
3. Usa los botones rápidos para consultas comunes

## 📊 Funcionalidades del Resumen de Gastos

### Total Gastado
Suma de todos los montos de todos los gastos registrados.

**Ejemplo**: Si tienes gastos de $100, $50, $200 y $75, el total es **$425**.

### Promedio por Gasto
Monto promedio de cada gasto individual, calculado como: `Total Gastado ÷ Cantidad de Gastos`.

**Ejemplo**: Con un total de $425 y 4 gastos, el promedio es **$106.25**.

### Total de Gastos
Cantidad total de gastos registrados en el sistema.

## 🔐 Seguridad

- Autenticación segura mediante Supabase Auth
- Datos encriptados en tránsito
- Sesiones de usuario gestionadas automáticamente

## 📱 Plataformas Soportadas

- ✅ iOS
- ✅ Android
- ✅ Web (con limitaciones)

## 🎨 Características de UI/UX

- **Navegación por tabs**: Sistema de navegación intuitivo con animaciones
- **Indicador animado**: Barra indicadora que se mueve entre tabs
- **Iconos escalables**: Los iconos de tabs crecen cuando están activos
- **Teclado adaptativo**: Los formularios se ajustan automáticamente al teclado
- **Scroll suave**: Navegación fluida en todas las pantallas

## 🐛 Solución de Problemas

### Error de conexión a Supabase
- Verifica que las credenciales en `config/supabase.js` sean correctas
- Asegúrate de que tu proyecto de Supabase esté activo

### Problemas con el teclado
- Los formularios ya están configurados con `KeyboardAvoidingView`
- Si persisten problemas, verifica la versión de React Native

### Avatares no se muestran
- Verifica que los archivos de imagen estén en `assets/images/`
- Asegúrate de haber desbloqueado el avatar con puntos

## 📝 Licencia

Este proyecto está bajo la licencia 0BSD.

## 👤 Autor

**Oni7u7**

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes preguntas o encuentras algún problema, por favor abre un issue en el repositorio.

## 🗺️ Roadmap

- [ ] Exportación de datos a CSV/PDF
- [ ] Notificaciones push para límites
- [ ] Sincronización en la nube mejorada
- [ ] Modo oscuro
- [ ] Más tipos de gráficas
- [ ] Integración con bancos (futuro)

---

⭐ Si te gusta este proyecto, ¡dale una estrella!

