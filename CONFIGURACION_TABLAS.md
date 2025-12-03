# Configuración de Tablas y Componentes - ExpTrack

Este documento describe cómo configurar y usar las tablas de Supabase y los componentes de la aplicación ExpTrack.

## 📋 Tablas de Base de Datos

Las siguientes tablas ya están creadas en tu proyecto de Supabase:

### 1. **categorias**
```sql
CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT
);
```

### 2. **gastos**
```sql
CREATE TABLE gastos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  monto REAL NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL
);
```

### 3. **limites**
```sql
CREATE TABLE limites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  monto_limite REAL NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  gasto_total REAL DEFAULT 0
);
```

### 4. **recompensas**
```sql
CREATE TABLE recompensas (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  semana TEXT,
  puntos INTEGER DEFAULT 0,
  titulo TEXT,
  descripcion TEXT,
  fecha_otorgada DATE DEFAULT CURRENT_DATE
);
```

## 🚀 Instalación de Dependencias

Antes de ejecutar la aplicación, asegúrate de instalar las dependencias necesarias:

```bash
npm install @react-native-picker/picker
```

O si usas yarn:

```bash
yarn add @react-native-picker/picker
```

## 📦 Componentes Creados

### 1. **HistorialTab** (`components/HistorialTab.js`)
- Muestra el historial completo de gastos del usuario
- Permite eliminar gastos
- Muestra categorías, montos y fechas formateadas
- Formato de moneda en pesos mexicanos (MXN)

### 2. **GastosTab** (`components/GastosTab.js`)
- Permite agregar nuevos gastos
- Muestra el límite actual y el progreso de gastos
- Selector de categorías
- Formulario modal para agregar gastos con:
  - Monto (requerido)
  - Categoría (opcional)
  - Descripción (opcional)
  - Fecha (por defecto: fecha actual)

### 3. **ChatbotTab** (`components/ChatbotTab.js`)
- Asistente virtual para consultar gastos y límites
- Comandos disponibles:
  - "gastos" o "gasto" - Muestra resumen de gastos
  - "límite" o "limite" - Muestra información del límite actual
  - "ayuda" o "help" - Muestra comandos disponibles
  - "consejo" o "ahorro" - Muestra consejos de ahorro

## 🔧 Servicios Creados

### 1. **gastosService.js**
Funciones disponibles:
- `getGastos(userId)` - Obtiene todos los gastos de un usuario
- `addGasto(userId, categoriaId, monto, descripcion, fecha)` - Agrega un nuevo gasto
- `deleteGasto(gastoId)` - Elimina un gasto
- `getGastosByDateRange(userId, fechaInicio, fechaFin)` - Obtiene gastos por rango de fechas

### 2. **categoriasService.js**
Funciones disponibles:
- `getCategorias()` - Obtiene todas las categorías
- `addCategoria(nombre, descripcion)` - Agrega una nueva categoría

### 3. **limitesService.js**
Funciones disponibles:
- `getLimiteActual(userId)` - Obtiene el límite actual del usuario
- `setLimite(userId, montoLimite, fechaInicio, fechaFin)` - Establece un nuevo límite
- `updateGastoTotal(limiteId, gastoTotal)` - Actualiza el gasto total de un límite

### 4. **recompensasService.js**
Funciones disponibles:
- `getRecompensas(userId)` - Obtiene todas las recompensas de un usuario
- `addRecompensa(userId, semana, puntos, titulo, descripcion)` - Agrega una nueva recompensa

## 📱 Tabs en HomeScreen

La aplicación tiene 5 tabs principales:

1. **Home** - Pantalla de bienvenida
2. **Historial** - Muestra el historial de gastos (usa `HistorialTab`)
3. **Perfil** - Información del usuario y cerrar sesión
4. **Gastos** - Agregar y gestionar gastos (usa `GastosTab`)
5. **Chatbot** - Asistente virtual (usa `ChatbotTab`)

## ⚙️ Configuración de Supabase

Asegúrate de que tu archivo `app.config.js` tenga las credenciales correctas:

```javascript
extra: {
  supabaseUrl: 'TU_URL_DE_SUPABASE',
  supabaseAnonKey: 'TU_ANON_KEY',
}
```

## 🔐 Políticas de Seguridad (RLS)

Para que la aplicación funcione correctamente, asegúrate de configurar las políticas RLS (Row Level Security) en Supabase:

### Para la tabla `gastos`:
```sql
-- Permitir que los usuarios vean solo sus propios gastos
CREATE POLICY "Users can view own gastos"
  ON gastos FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Permitir que los usuarios inserten sus propios gastos
CREATE POLICY "Users can insert own gastos"
  ON gastos FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Permitir que los usuarios eliminen sus propios gastos
CREATE POLICY "Users can delete own gastos"
  ON gastos FOR DELETE
  USING (auth.uid()::text = user_id::text);
```

**Nota:** Si estás usando autenticación personalizada (como en este proyecto), es posible que necesites ajustar las políticas RLS o deshabilitarlas temporalmente para desarrollo.

### Para la tabla `limites`:
```sql
CREATE POLICY "Users can view own limites"
  ON limites FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own limites"
  ON limites FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);
```

### Para la tabla `recompensas`:
```sql
CREATE POLICY "Users can view own recompensas"
  ON recompensas FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own recompensas"
  ON recompensas FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);
```

### Para la tabla `categorias`:
```sql
-- Las categorías pueden ser públicas (todos pueden verlas)
CREATE POLICY "Anyone can view categorias"
  ON categorias FOR SELECT
  USING (true);
```

## 🧪 Datos de Prueba

Para probar la aplicación, puedes insertar algunas categorías de ejemplo:

```sql
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Alimentos', 'Gastos en comida y bebidas'),
  ('Transporte', 'Gastos de transporte'),
  ('Entretenimiento', 'Gastos de ocio y entretenimiento'),
  ('Servicios', 'Servicios públicos y privados'),
  ('Salud', 'Gastos médicos y de salud');
```

## 🐛 Solución de Problemas

### Error: "Picker is not a valid component"
- **Solución:** Instala `@react-native-picker/picker` con `npm install @react-native-picker/picker`

### Error: "Faltan las credenciales de Supabase"
- **Solución:** Verifica que `app.config.js` tenga las credenciales correctas de Supabase

### Error: "permission denied for table"
- **Solución:** Configura las políticas RLS en Supabase o deshabilítalas temporalmente para desarrollo

### Los gastos no se muestran
- **Solución:** Verifica que el `user_id` en los gastos coincida con el `id` del usuario logueado

## 📝 Notas Importantes

1. **Formato de Fecha:** Las fechas se manejan en formato `YYYY-MM-DD` (ISO 8601)
2. **Formato de Moneda:** Los montos se formatean en pesos mexicanos (MXN)
3. **User ID:** Asegúrate de que el objeto `user` tenga la propiedad `id` correcta
4. **Categorías:** Las categorías son opcionales al agregar un gasto

## 🎯 Próximos Pasos

Para mejorar la aplicación, considera:

1. Agregar funcionalidad para editar gastos
2. Implementar gráficos de gastos por categoría
3. Agregar notificaciones cuando se acerque al límite
4. Mejorar el chatbot con más funcionalidades
5. Agregar exportación de gastos (CSV, PDF)
6. Implementar sincronización automática del gasto_total en límites

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [React Native Picker](https://github.com/react-native-picker/picker)
- [Expo Documentation](https://docs.expo.dev/)




