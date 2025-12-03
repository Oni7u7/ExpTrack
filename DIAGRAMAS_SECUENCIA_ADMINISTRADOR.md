# Diagramas de Secuencia - Administrador

## ⚠️ Nota Importante

**Este documento no aplica para el sistema ExpTrack actual.**

### Razón

El sistema ExpTrack es una aplicación móvil de seguimiento de gastos personales diseñada exclusivamente para usuarios finales. No existe un rol de administrador en la arquitectura actual del sistema.

### Arquitectura Actual

- **Tipo de Sistema**: Aplicación móvil personal
- **Usuarios**: Solo usuarios finales
- **Modelo de Datos**: Cada usuario gestiona únicamente sus propios datos
- **Seguridad**: Aislamiento de datos mediante `user_id` en todas las tablas

---

## Si se implementara un rol de administrador en el futuro

A continuación se presentan diagramas de secuencia hipotéticos para operaciones administrativas que podrían implementarse en el futuro:

---

## Diagrama de Secuencia - Ver Lista de Usuarios (Futuro)

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant UI as Interfaz Administrativa
    participant AS as adminService
    participant Auth as authService
    participant SB as Supabase
    participant DB as Base de Datos

    Note over Admin,DB: Ver Lista de Usuarios
    Admin->>UI: Acceder a panel de administración
    UI->>Auth: Verificar rol de administrador
    Auth->>SB: SELECT rol FROM usuarios WHERE id = ?
    SB->>DB: Query rol
    DB-->>SB: Rol del usuario
    SB-->>Auth: Rol
    alt Rol es administrador
        Auth-->>UI: Acceso autorizado
        UI->>AS: getAllUsers()
        AS->>SB: SELECT * FROM usuarios ORDER BY fecha_registro DESC
        SB->>DB: Query usuarios
        DB-->>SB: Lista de usuarios
        SB-->>AS: Usuarios
        AS-->>UI: Lista de usuarios (sin passwords)
        UI-->>Admin: Mostrar tabla de usuarios
    else Rol no es administrador
        Auth-->>UI: Acceso denegado
        UI-->>Admin: Error: No tienes permisos
    end
```

---

## Diagrama de Secuencia - Gestionar Categorías Globales (Futuro)

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant UI as Interfaz Administrativa
    participant AS as adminService
    participant CS as categoriasService
    participant SB as Supabase
    participant DB as Base de Datos

    Note over Admin,DB: Crear Categoría Global
    Admin->>UI: Crear nueva categoría
    UI->>Admin: Mostrar formulario
    Admin->>UI: Ingresar nombre y descripción
    UI->>AS: createGlobalCategory(nombre, descripcion)
    AS->>AS: Validar permisos de administrador
    AS->>CS: addCategoria(nombre, descripcion)
    CS->>SB: INSERT INTO categorias
    SB->>DB: Insertar categoría
    DB-->>SB: Categoría creada
    SB-->>CS: Datos de la categoría
    CS-->>AS: Categoría creada
    AS-->>UI: { data: categoria, error: null }
    UI-->>Admin: Categoría creada exitosamente

    Note over Admin,DB: Editar Categoría Global
    Admin->>UI: Seleccionar categoría a editar
    UI->>AS: getCategory(categoriaId)
    AS->>SB: SELECT * FROM categorias WHERE id = ?
    SB->>DB: Query categoría
    DB-->>SB: Datos de la categoría
    SB-->>AS: Categoría
    AS-->>UI: Datos de la categoría
    UI-->>Admin: Mostrar formulario con datos
    Admin->>UI: Modificar datos
    UI->>AS: updateCategory(categoriaId, nombre, descripcion)
    AS->>SB: UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?
    SB->>DB: Actualizar categoría
    DB-->>SB: Categoría actualizada
    SB-->>AS: Confirmación
    AS-->>UI: { data: categoria, error: null }
    UI-->>Admin: Categoría actualizada

    Note over Admin,DB: Eliminar Categoría Global
    Admin->>UI: Seleccionar categoría a eliminar
    UI->>Admin: Confirmar eliminación
    Admin->>UI: Confirmar
    UI->>AS: deleteCategory(categoriaId)
    AS->>SB: SELECT COUNT(*) FROM gastos WHERE categoria_id = ?
    SB->>DB: Contar gastos con esta categoría
    DB-->>SB: Cantidad de gastos
    SB-->>AS: Cantidad
    alt Hay gastos con esta categoría
        AS-->>UI: { error: "No se puede eliminar: hay gastos asociados" }
        UI-->>Admin: Error: Categoría en uso
    else No hay gastos
        AS->>SB: DELETE FROM categorias WHERE id = ?
        SB->>DB: Eliminar categoría
        DB-->>SB: Categoría eliminada
        SB-->>AS: Confirmación
        AS-->>UI: { error: null }
        UI-->>Admin: Categoría eliminada
    end
```

---

## Diagrama de Secuencia - Ver Estadísticas Globales (Futuro)

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant UI as Interfaz Administrativa
    participant AS as adminService
    participant SB as Supabase
    participant DB as Base de Datos

    Note over Admin,DB: Ver Estadísticas Globales
    Admin->>UI: Acceder a panel de estadísticas
    UI->>AS: getGlobalStatistics()
    AS->>SB: SELECT COUNT(*) FROM usuarios
    SB->>DB: Contar usuarios
    DB-->>SB: Total de usuarios
    SB-->>AS: Total usuarios
    
    AS->>SB: SELECT COUNT(*) FROM gastos
    SB->>DB: Contar gastos
    DB-->>SB: Total de gastos
    SB-->>AS: Total gastos
    
    AS->>SB: SELECT SUM(monto) FROM gastos
    SB->>DB: Sumar montos
    DB-->>SB: Total gastado
    SB-->>AS: Total gastado
    
    AS->>SB: SELECT COUNT(*) FROM limites
    SB->>DB: Contar límites
    DB-->>SB: Total de límites
    SB-->>AS: Total límites
    
    AS->>SB: SELECT COUNT(*) FROM recompensas
    SB->>DB: Contar recompensas
    DB-->>SB: Total de recompensas
    SB-->>AS: Total recompensas
    
    AS->>AS: Calcular promedios y métricas
    AS-->>UI: {
        totalUsuarios,
        totalGastos,
        totalGastado,
        totalLimites,
        totalRecompensas,
        promedioGastosPorUsuario,
        promedioGastadoPorUsuario
    }
    UI-->>Admin: Mostrar dashboard con estadísticas
```

---

## Diagrama de Secuencia - Gestionar Usuario (Futuro)

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant UI as Interfaz Administrativa
    participant AS as adminService
    participant SB as Supabase
    participant DB as Base de Datos

    Note over Admin,DB: Desactivar Usuario
    Admin->>UI: Seleccionar usuario
    UI->>AS: getUserDetails(userId)
    AS->>SB: SELECT * FROM usuarios WHERE id = ?
    SB->>DB: Query usuario
    DB-->>SB: Datos del usuario
    SB-->>AS: Usuario
    AS-->>UI: Datos del usuario
    UI-->>Admin: Mostrar detalles del usuario
    Admin->>UI: Clic en "Desactivar"
    UI->>Admin: Confirmar desactivación
    Admin->>UI: Confirmar
    UI->>AS: deactivateUser(userId)
    AS->>SB: UPDATE usuarios SET activo = false WHERE id = ?
    SB->>DB: Actualizar usuario
    DB-->>SB: Usuario desactivado
    SB-->>AS: Confirmación
    AS-->>UI: { error: null }
    UI-->>Admin: Usuario desactivado

    Note over Admin,DB: Eliminar Usuario
    Admin->>UI: Seleccionar usuario a eliminar
    UI->>Admin: Confirmar eliminación (advertencia)
    Admin->>UI: Confirmar eliminación
    UI->>AS: deleteUser(userId)
    AS->>SB: SELECT COUNT(*) FROM gastos WHERE user_id = ?
    SB->>DB: Contar gastos del usuario
    DB-->>SB: Cantidad de gastos
    SB-->>AS: Cantidad
    
    Note over AS,DB: Eliminar datos relacionados (CASCADE)
    AS->>SB: DELETE FROM gastos WHERE user_id = ?
    SB->>DB: Eliminar gastos
    DB-->>SB: Gastos eliminados
    
    AS->>SB: DELETE FROM limites WHERE user_id = ?
    SB->>DB: Eliminar límites
    DB-->>SB: Límites eliminados
    
    AS->>SB: DELETE FROM recompensas WHERE user_id = ?
    SB->>DB: Eliminar recompensas
    DB-->>SB: Recompensas eliminadas
    
    AS->>SB: DELETE FROM usuarios WHERE id = ?
    SB->>DB: Eliminar usuario
    DB-->>SB: Usuario eliminado
    SB-->>AS: Confirmación
    AS-->>UI: { error: null }
    UI-->>Admin: Usuario y datos relacionados eliminados
```

---

## Diagrama de Secuencia - Ver Logs del Sistema (Futuro)

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant UI as Interfaz Administrativa
    participant AS as adminService
    participant SB as Supabase
    participant DB as Base de Datos

    Note over Admin,DB: Ver Logs del Sistema
    Admin->>UI: Acceder a sección de logs
    UI->>AS: getSystemLogs(filtros)
    AS->>SB: SELECT * FROM logs WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC
    SB->>DB: Query logs
    DB-->>SB: Lista de logs
    SB-->>AS: Logs
    AS->>AS: Filtrar y formatear logs
    AS-->>UI: Lista de logs formateada
    UI-->>Admin: Mostrar tabla de logs con:
    Note over UI: - Fecha y hora
    Note over UI: - Usuario
    Note over UI: - Acción realizada
    Note over UI: - Detalles
    Note over UI: - IP de origen
```

---

## Consideraciones para Implementación Futura

Si se decide implementar funcionalidad administrativa, se requeriría:

### 1. Modificaciones en la Base de Datos

```sql
-- Agregar campo de rol
ALTER TABLE usuarios ADD COLUMN rol TEXT DEFAULT 'usuario';

-- Crear tabla de logs
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES usuarios(id),
  accion TEXT NOT NULL,
  detalles TEXT,
  ip_origen TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de configuración
CREATE TABLE configuracion (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  descripcion TEXT,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Nuevos Servicios

- `adminService.js`: Funciones administrativas
- `logService.js`: Registro de actividades
- `configService.js`: Gestión de configuración del sistema

### 3. Políticas de Seguridad

- Implementar RLS (Row Level Security) en Supabase
- Validar rol de administrador en cada operación
- Registrar todas las acciones administrativas

### 4. Interfaz de Usuario

- Panel de administración separado
- Navegación condicional basada en rol
- Componentes de gestión administrativa

---

## Conclusión

**Estado Actual**: No hay funcionalidad de administrador en ExpTrack.

**Recomendación**: Si se requiere funcionalidad administrativa en el futuro, se debe planificar como una nueva característica que incluya:
- Diseño detallado de casos de uso administrativos
- Diagramas de secuencia para cada operación
- Actualización de la arquitectura del sistema
- Implementación de seguridad y auditoría

---

**Última actualización**: 2024
**Versión del documento**: 1.0
**Estado**: No aplica - Sistema sin rol de administrador

