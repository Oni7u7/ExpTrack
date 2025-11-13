# Configuración de Supabase

## Pasos para conectar con Supabase

### 1. Obtener las credenciales de Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta o inicia sesión
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Settings** > **API**
4. Copia los siguientes valores:
   - **Project URL** (URL del proyecto)
   - **anon public** key (Clave pública anónima)

### 2. Configurar las variables de entorno

Tienes dos opciones:

#### Opción A: Usar variables de entorno (Recomendado)

Crea un archivo `.env` en la raíz del proyecto con:

```
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase_aqui
```

**Nota:** En Expo, las variables de entorno deben comenzar con `EXPO_PUBLIC_` para ser accesibles en el cliente.

#### Opción B: Configurar directamente en app.config.js

Edita el archivo `app.config.js` y reemplaza los valores vacíos:

```javascript
extra: {
  supabaseUrl: "tu_url_de_supabase_aqui",
  supabaseAnonKey: "tu_clave_anonima_de_supabase_aqui",
}
```

### 3. Reiniciar el servidor de desarrollo

Después de configurar las variables de entorno, reinicia el servidor de Expo:

```bash
npm start
```

### 4. Verificar la conexión

La aplicación incluye un botón para verificar la conexión. Presiona "Verificar Conexión" para probar que todo funciona correctamente.

## Uso del cliente de Supabase

El cliente de Supabase está configurado en `config/supabase.js` y puede ser importado en cualquier componente:

```javascript
import { supabase } from './config/supabase';

// Ejemplo: Consultar datos
const { data, error } = await supabase
  .from('nombre_tabla')
  .select('*');

// Ejemplo: Insertar datos
const { data, error } = await supabase
  .from('nombre_tabla')
  .insert([{ campo: 'valor' }]);

// Ejemplo: Autenticación
const { data, error } = await supabase.auth.signUp({
  email: 'usuario@ejemplo.com',
  password: 'contraseña123'
});
```

## Documentación

Para más información sobre cómo usar Supabase, visita:
- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

