# Diagramas de Casos de Uso y Secuencias - ExpTrack

Este documento contiene los diagramas de casos de uso y secuencias generales del sistema ExpTrack.

## 📋 Índice

1. [Diagrama de Casos de Uso General](#diagrama-de-casos-de-uso-general)
2. [Diagrama de Secuencia - Autenticación](#diagrama-de-secuencia---autenticación)
3. [Diagrama de Secuencia - Gestión de Gastos](#diagrama-de-secuencia---gestión-de-gastos)
4. [Diagrama de Secuencia - Sistema de Límites](#diagrama-de-secuencia---sistema-de-límites)
5. [Diagrama de Secuencia - Sistema de Recompensas](#diagrama-de-secuencia---sistema-de-recompensas)

---

## Diagrama de Casos de Uso General

```mermaid
graph TB
    Usuario[Usuario]
    
    %% Autenticación
    UC1[Registrarse]
    UC2[Iniciar Sesión]
    UC3[Cerrar Sesión]
    
    %% Gestión de Gastos
    UC4[Agregar Gasto]
    UC5[Ver Historial de Gastos]
    UC6[Eliminar Gasto]
    UC7[Ver Estadísticas y Gráficas]
    
    %% Sistema de Límites
    UC8[Establecer Límite de Gastos]
    UC9[Ver Límites Activos]
    UC10[Calcular Límite desde Gastos Anteriores]
    
    %% Sistema de Recompensas
    UC11[Ver Recompensas]
    UC12[Desbloquear Avatar]
    UC13[Seleccionar Avatar]
    UC14[Ver Puntos Disponibles]
    
    %% Chatbot
    UC15[Consultar Gastos vía Chatbot]
    UC16[Consultar Límites vía Chatbot]
    UC17[Obtener Consejos de Ahorro]
    UC18[Ver Análisis de Gastos]
    
    %% Perfil
    UC19[Ver Perfil]
    UC20[Actualizar Información de Perfil]
    
    Usuario --> UC1
    Usuario --> UC2
    Usuario --> UC3
    Usuario --> UC4
    Usuario --> UC5
    Usuario --> UC6
    Usuario --> UC7
    Usuario --> UC8
    Usuario --> UC9
    Usuario --> UC10
    Usuario --> UC11
    Usuario --> UC12
    Usuario --> UC13
    Usuario --> UC14
    Usuario --> UC15
    Usuario --> UC16
    Usuario --> UC17
    Usuario --> UC18
    Usuario --> UC19
    Usuario --> UC20
    
    style Usuario fill:#5B715B,stroke:#333,stroke-width:2px,color:#fff
    style UC1 fill:#E8F5E9,stroke:#4CAF50
    style UC2 fill:#E8F5E9,stroke:#4CAF50
    style UC3 fill:#E8F5E9,stroke:#4CAF50
    style UC4 fill:#E3F2FD,stroke:#2196F3
    style UC5 fill:#E3F2FD,stroke:#2196F3
    style UC6 fill:#E3F2FD,stroke:#2196F3
    style UC7 fill:#E3F2FD,stroke:#2196F3
    style UC8 fill:#FFF3E0,stroke:#FF9800
    style UC9 fill:#FFF3E0,stroke:#FF9800
    style UC10 fill:#FFF3E0,stroke:#FF9800
    style UC11 fill:#F3E5F5,stroke:#9C27B0
    style UC12 fill:#F3E5F5,stroke:#9C27B0
    style UC13 fill:#F3E5F5,stroke:#9C27B0
    style UC14 fill:#F3E5F5,stroke:#9C27B0
    style UC15 fill:#E0F2F1,stroke:#009688
    style UC16 fill:#E0F2F1,stroke:#009688
    style UC17 fill:#E0F2F1,stroke:#009688
    style UC18 fill:#E0F2F1,stroke:#009688
    style UC19 fill:#FAFAFA,stroke:#757575
    style UC20 fill:#FAFAFA,stroke:#757575
```

---

## Diagrama de Secuencia - Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Interfaz de Usuario
    participant AS as authService
    participant SB as Supabase
    participant DB as Base de Datos

    Note over U,DB: Registro de Usuario
    U->>UI: Ingresar datos (nombre, email, password)
    UI->>AS: registerUser(nombre, email, password)
    AS->>AS: Validar campos
    AS->>SB: Verificar si email existe
    SB->>DB: SELECT email FROM usuarios WHERE email = ?
    DB-->>SB: Resultado
    SB-->>AS: Email no existe
    AS->>AS: Hash password (SHA256)
    AS->>SB: INSERT usuario
    SB->>DB: INSERT INTO usuarios
    DB-->>SB: Usuario creado
    SB-->>AS: Datos del usuario
    AS-->>UI: { data: usuario, error: null }
    UI-->>U: Registro exitoso

    Note over U,DB: Inicio de Sesión
    U->>UI: Ingresar email y password
    UI->>AS: loginUser(email, password)
    AS->>AS: Validar campos
    AS->>AS: Hash password
    AS->>SB: SELECT usuario WHERE email = ?
    SB->>DB: SELECT * FROM usuarios WHERE email = ?
    DB-->>SB: Datos del usuario
    SB-->>AS: Datos del usuario
    AS->>AS: Comparar passwords
    alt Password correcto
        AS-->>UI: { data: usuario, error: null }
        UI-->>U: Inicio de sesión exitoso
    else Password incorrecto
        AS-->>UI: { error: "Email o contraseña incorrectos" }
        UI-->>U: Error de autenticación
    end

    Note over U,DB: Cerrar Sesión
    U->>UI: Clic en "Cerrar Sesión"
    UI->>AS: logoutUser()
    AS-->>UI: { error: null }
    UI-->>U: Sesión cerrada
```

---

## Diagrama de Secuencia - Gestión de Gastos

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Interfaz de Usuario
    participant GS as gastosService
    participant LS as limitesService
    participant CS as categoriasService
    participant SB as Supabase
    participant DB as Base de Datos

    Note over U,DB: Agregar Gasto
    U->>UI: Abrir modal de agregar gasto
    UI->>CS: getCategorias()
    CS->>SB: SELECT * FROM categorias
    SB->>DB: Query categorias
    DB-->>SB: Lista de categorias
    SB-->>CS: Categorias
    CS-->>UI: Categorias disponibles
    U->>UI: Completar formulario (monto, categoria, descripcion, fecha)
    U->>UI: Guardar gasto
    UI->>GS: addGasto(userId, categoriaId, monto, descripcion, fecha)
    GS->>GS: Validar monto > 0
    GS->>SB: INSERT INTO gastos
    SB->>DB: INSERT gasto
    DB-->>SB: Gasto creado
    SB-->>GS: Datos del gasto
    
    Note over GS,DB: Actualizar límites afectados
    GS->>SB: SELECT limites WHERE fecha_inicio <= fecha AND fecha_fin >= fecha
    SB->>DB: Query limites
    DB-->>SB: Límites afectados
    SB-->>GS: Lista de limites
    
    loop Para cada límite afectado
        GS->>SB: SELECT SUM(monto) FROM gastos WHERE fecha BETWEEN fecha_inicio AND fecha_fin
        SB->>DB: Calcular total
        DB-->>SB: Total gastado
        SB-->>GS: Total
        GS->>LS: updateGastoTotal(limiteId, nuevoTotal)
        LS->>SB: UPDATE limites SET gasto_total = ?
        SB->>DB: Actualizar límite
        DB-->>SB: Límite actualizado
        SB-->>LS: Confirmación
        LS-->>GS: Confirmación
        
        alt Límite excedido
            GS->>GS: Marcar limiteRebasado = true
        end
    end
    
    GS-->>UI: { data: gasto, error: null, limiteRebasado }
    alt Límite excedido
        UI-->>U: Alerta: Límite excedido
    else Éxito
        UI-->>U: Gasto agregado exitosamente
    end

    Note over U,DB: Ver Historial de Gastos
    U->>UI: Abrir pestaña Historial
    UI->>GS: getGastos(userId)
    GS->>SB: SELECT gastos JOIN categorias WHERE user_id = ?
    SB->>DB: Query con JOIN
    DB-->>SB: Lista de gastos con categorias
    SB-->>GS: Gastos
    GS-->>UI: Lista de gastos
    UI-->>U: Mostrar historial

    Note over U,DB: Eliminar Gasto
    U->>UI: Clic en eliminar gasto
    UI->>U: Confirmar eliminación
    U->>UI: Confirmar
    UI->>GS: deleteGasto(gastoId, userId)
    GS->>SB: SELECT gasto WHERE id = ?
    SB->>DB: Query gasto
    DB-->>SB: Datos del gasto
    SB-->>GS: Gasto a eliminar
    GS->>SB: DELETE FROM gastos WHERE id = ?
    SB->>DB: Eliminar gasto
    DB-->>SB: Gasto eliminado
    SB-->>GS: Confirmación
    
    Note over GS,DB: Actualizar límite si aplica
    GS->>LS: getLimiteActual(userId)
    LS->>SB: SELECT limite activo
    SB-->>LS: Límite activo
    LS-->>GS: Límite activo
    alt Gasto estaba en período del límite
        GS->>SB: SELECT SUM(monto) FROM gastos WHERE fecha BETWEEN fecha_inicio AND fecha_fin
        SB->>DB: Calcular nuevo total
        DB-->>SB: Nuevo total
        SB-->>GS: Total
        GS->>LS: updateGastoTotal(limiteId, nuevoTotal)
        LS->>SB: UPDATE limites
        SB->>DB: Actualizar
        DB-->>SB: Confirmación
        SB-->>LS: Confirmación
        LS-->>GS: Confirmación
    end
    
    GS-->>UI: { error: null }
    UI->>GS: getGastos(userId) [refrescar]
    GS->>SB: SELECT gastos
    SB-->>GS: Lista actualizada
    GS-->>UI: Gastos actualizados
    UI-->>U: Historial actualizado
```

---

## Diagrama de Secuencia - Sistema de Límites

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Interfaz de Usuario
    participant LS as limitesService
    participant GS as gastosService
    participant RS as recompensasService
    participant SB as Supabase
    participant DB as Base de Datos

    Note over U,DB: Establecer Nuevo Límite
    U->>UI: Abrir pestaña Límite
    U->>UI: Clic en "Agregar Nuevo Límite"
    UI->>U: Mostrar opción: Calcular desde gastos anteriores
    alt Calcular desde gastos anteriores
        U->>UI: Seleccionar calcular
        UI->>GS: getGastosByDateRange(userId, mesAnteriorInicio, mesAnteriorFin)
        GS->>SB: SELECT gastos WHERE fecha BETWEEN ?
        SB->>DB: Query gastos del mes anterior
        DB-->>SB: Gastos del mes anterior
        SB-->>GS: Lista de gastos
        GS->>GS: Calcular total = SUM(monto)
        GS-->>UI: Total de gastos anteriores
        UI->>U: Mostrar monto sugerido
    end
    
    U->>UI: Ingresar monto límite, fecha inicio, fecha fin
    U->>UI: Guardar límite
    UI->>LS: setLimite(userId, montoLimite, fechaInicio, fechaFin)
    LS->>LS: Validar monto > 0
    LS->>SB: INSERT INTO limites
    SB->>DB: INSERT límite
    DB-->>SB: Límite creado
    SB-->>LS: Datos del límite
    
    Note over LS,DB: Calcular gasto total inicial
    LS->>GS: getGastosByDateRange(userId, fechaInicio, fechaFin)
    GS->>SB: SELECT gastos WHERE fecha BETWEEN ?
    SB->>DB: Query gastos del período
    DB-->>SB: Gastos del período
    SB-->>GS: Lista de gastos
    GS->>GS: Calcular total = SUM(monto)
    GS-->>LS: Total gastado
    LS->>LS: updateGastoTotal(limiteId, gastoTotal)
    LS->>SB: UPDATE limites SET gasto_total = ?
    SB->>DB: Actualizar gasto_total
    DB-->>SB: Límite actualizado
    SB-->>LS: Confirmación
    LS-->>UI: { data: limite, error: null }
    UI-->>U: Límite establecido exitosamente

    Note over U,DB: Ver Límites
    U->>UI: Abrir pestaña Límite
    UI->>LS: getAllLimites(userId)
    LS->>SB: SELECT * FROM limites WHERE user_id = ?
    SB->>DB: Query limites
    DB-->>SB: Lista de limites
    SB-->>LS: Límites
    LS-->>UI: Lista de limites
    
    Note over UI,DB: Verificar y otorgar recompensas
    loop Para cada límite concluido
        alt Límite ya terminó
            UI->>RS: verificarYOtorgarRecompensa(userId, limiteId)
            RS->>SB: SELECT limite WHERE id = ?
            SB->>DB: Query límite
            DB-->>SB: Datos del límite
            SB-->>RS: Límite
            RS->>RS: Calcular porcentajeUso = gasto_total / monto_limite
            RS->>SB: SELECT recompensa WHERE semana = "Límite X"
            SB->>DB: Verificar si ya existe
            DB-->>SB: Resultado
            SB-->>RS: Recompensa existente o no
            
            alt No existe recompensa y porcentajeUso <= 0.8
                RS->>RS: puntos = 100, titulo = "Excelente Control"
                RS->>RS: addRecompensa(userId, semana, puntos, titulo, descripcion)
                RS->>SB: INSERT INTO recompensas
                SB->>DB: Insertar recompensa
                DB-->>SB: Recompensa creada
                SB-->>RS: Confirmación
            else No existe recompensa y porcentajeUso <= 1.0
                RS->>RS: puntos = 50, titulo = "Límite Cumplido"
                RS->>RS: addRecompensa(userId, semana, puntos, titulo, descripcion)
                RS->>SB: INSERT INTO recompensas
                SB->>DB: Insertar recompensa
                DB-->>SB: Recompensa creada
                SB-->>RS: Confirmación
            end
            RS-->>UI: Recompensa otorgada (si aplica)
        end
    end
    
    UI-->>U: Mostrar límites con estados (activo, concluido, futuro)
```

---

## Diagrama de Secuencia - Sistema de Recompensas

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Interfaz de Usuario
    participant RS as recompensasService
    participant SB as Supabase
    participant DB as Base de Datos

    Note over U,DB: Ver Recompensas
    U->>UI: Abrir pestaña Recompensas
    UI->>RS: getRecompensas(userId)
    RS->>SB: SELECT * FROM recompensas WHERE user_id = ? ORDER BY fecha_otorgada DESC
    SB->>DB: Query recompensas
    DB-->>SB: Lista de recompensas
    SB-->>RS: Recompensas
    RS-->>UI: Lista de recompensas
    UI->>UI: Calcular puntos totales (excluyendo desbloqueos)
    UI->>UI: Calcular puntos gastados (solo desbloqueos)
    UI->>UI: Calcular puntos disponibles = totales - gastados
    UI-->>U: Mostrar recompensas y puntos disponibles

    Note over U,DB: Desbloquear Avatar
    U->>UI: Cambiar a vista "Tienda"
    UI-->>U: Mostrar items disponibles
    U->>UI: Seleccionar avatar para desbloquear
    UI->>UI: Verificar puntos disponibles >= puntos requeridos
    alt Puntos suficientes
        UI->>U: Confirmar desbloqueo
        U->>UI: Confirmar
        UI->>RS: addRecompensa(userId, "desbloqueo_avatar_X", -puntos, "Desbloqueado: Avatar X", descripcion)
        RS->>SB: INSERT INTO recompensas (puntos negativos)
        SB->>DB: Insertar recompensa de desbloqueo
        DB-->>SB: Recompensa creada
        SB-->>RS: Confirmación
        RS-->>UI: { data: recompensa, error: null }
        UI->>RS: getRecompensas(userId) [refrescar]
        RS->>SB: SELECT recompensas
        SB-->>RS: Lista actualizada
        RS-->>UI: Recompensas actualizadas
        UI-->>U: Avatar desbloqueado exitosamente
    else Puntos insuficientes
        UI-->>U: Error: Puntos insuficientes
    end

    Note over U,DB: Seleccionar Avatar
    U->>UI: Seleccionar avatar desbloqueado
    UI->>UI: Verificar si está desbloqueado
    alt Avatar desbloqueado
        UI->>UI: Actualizar estado local (avatarSeleccionado)
        UI->>UI: Notificar componente padre (HomeScreen)
        UI->>UI: Actualizar avatar en perfil
        UI-->>U: Avatar seleccionado y mostrado en perfil
    else Avatar no desbloqueado
        UI-->>U: Error: Debes desbloquear el avatar primero
    end

    Note over U,DB: Ver Puntos Disponibles
    U->>UI: Ver pestaña Recompensas
    UI->>RS: getRecompensas(userId)
    RS->>SB: SELECT recompensas
    SB-->>RS: Todas las recompensas
    RS-->>UI: Lista de recompensas
    UI->>UI: Filtrar recompensas obtenidas (excluir desbloqueos)
    UI->>UI: Sumar puntos de recompensas obtenidas = puntosTotales
    UI->>UI: Filtrar desbloqueos (semana LIKE "desbloqueo_%")
    UI->>UI: Sumar puntos absolutos de desbloqueos = puntosGastados
    UI->>UI: Calcular puntosDisponibles = puntosTotales - puntosGastados
    UI-->>U: Mostrar puntos disponibles en tarjeta resumen
```

---

## Notas sobre los Diagramas

### Casos de Uso
- **Autenticación**: Registro, inicio de sesión y cierre de sesión
- **Gestión de Gastos**: CRUD completo de gastos con categorización
- **Sistema de Límites**: Establecimiento y seguimiento de límites de gasto
- **Sistema de Recompensas**: Obtención de puntos y desbloqueo de avatares
- **Chatbot**: Consultas interactivas sobre gastos y límites
- **Perfil**: Visualización y gestión de información del usuario

### Secuencias
- Todas las secuencias muestran la interacción completa entre componentes
- Se incluyen validaciones y manejo de errores
- Las actualizaciones de límites son automáticas cuando se agregan/eliminan gastos
- El sistema de recompensas se verifica automáticamente al cargar límites

---

**Última actualización**: 2024
**Versión del documento**: 1.0

