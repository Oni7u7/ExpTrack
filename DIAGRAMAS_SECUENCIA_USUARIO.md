# Diagramas de Secuencia - Usuario

Este documento contiene los diagramas de secuencia específicos para las operaciones del Usuario en el sistema ExpTrack.

## 📋 Índice

1. [Agregar Gasto](#diagrama-de-secuencia---agregar-gasto)
2. [Eliminar Gasto](#diagrama-de-secuencia---eliminar-gasto)
3. [Establecer Límite](#diagrama-de-secuencia---establecer-límite)
4. [Desbloquear Avatar](#diagrama-de-secuencia---desbloquear-avatar)
5. [Consultar Chatbot](#diagrama-de-secuencia---consultar-chatbot)
6. [Ver Estadísticas](#diagrama-de-secuencia---ver-estadísticas)

---

## Diagrama de Secuencia - Agregar Gasto

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Interfaz
    participant AM as AddGastoModal
    participant GS as gastosService
    participant LS as limitesService
    participant SB as Supabase
    participant DB as Base de Datos

    U->>UI: Abrir modal de agregar gasto
    UI->>AM: Mostrar formulario
    U->>AM: Completar formulario (monto, categoría, descripción, fecha)
    U->>AM: Guardar gasto
    AM->>AM: Validar monto > 0
    AM->>GS: addGasto(userId, categoriaId, monto, descripcion, fecha)
    GS->>SB: INSERT INTO gastos
    SB->>DB: Crear gasto
    DB-->>SB: Gasto creado
    SB-->>GS: Datos del gasto
    
    Note over GS,DB: Actualizar límites afectados
    GS->>SB: SELECT limites WHERE fecha_inicio <= fecha AND fecha_fin >= fecha
    SB->>DB: Query límites
    DB-->>SB: Límites afectados
    SB-->>GS: Lista de límites
    
    loop Para cada límite
        GS->>SB: SELECT SUM(monto) FROM gastos WHERE fecha BETWEEN ?
        SB->>DB: Calcular total
        DB-->>SB: Total gastado
        SB-->>GS: Total
        GS->>LS: updateGastoTotal(limiteId, nuevoTotal)
        LS->>SB: UPDATE limites SET gasto_total = ?
        SB->>DB: Actualizar
        DB-->>SB: Confirmación
        SB-->>LS: Confirmación
        LS-->>GS: Confirmación
        
        alt Límite excedido
            GS->>GS: limiteRebasado = true
        end
    end
    
    GS-->>AM: { data: gasto, error: null, limiteRebasado }
    alt Límite excedido
        AM-->>U: Alerta: Límite excedido
    else Éxito
        AM-->>U: Gasto agregado exitosamente
    end
    AM->>UI: onGastoAdded()
    UI->>UI: Refrescar tabs
```

---

## Diagrama de Secuencia - Eliminar Gasto

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as HistorialTab
    participant GS as gastosService
    participant LS as limitesService
    participant SB as Supabase
    participant DB as Base de Datos

    U->>UI: Clic en eliminar gasto
    UI->>U: Mostrar confirmación
    U->>UI: Confirmar eliminación
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
        GS->>SB: SELECT SUM(monto) FROM gastos WHERE fecha BETWEEN ?
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

## Diagrama de Secuencia - Establecer Límite

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as LimiteTab
    participant LS as limitesService
    participant GS as gastosService
    participant RS as recompensasService
    participant SB as Supabase
    participant DB as Base de Datos

    U->>UI: Abrir pestaña Límite
    U->>UI: Clic en "Agregar Nuevo Límite"
    
    alt Calcular desde gastos anteriores
        UI->>GS: getGastosByDateRange(userId, mesAnteriorInicio, mesAnteriorFin)
        GS->>SB: SELECT gastos WHERE fecha BETWEEN ?
        SB->>DB: Query gastos del mes anterior
        DB-->>SB: Gastos
        SB-->>GS: Lista de gastos
        GS->>GS: Calcular total = SUM(monto)
        GS-->>UI: Total de gastos anteriores
        UI-->>U: Mostrar monto sugerido
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
    DB-->>SB: Gastos
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
    
    Note over UI,DB: Verificar recompensas para límites concluidos
    UI->>LS: getAllLimites(userId)
    LS->>SB: SELECT limites
    SB-->>LS: Lista de límites
    LS-->>UI: Límites
    
    loop Para cada límite concluido
        UI->>RS: verificarYOtorgarRecompensa(userId, limiteId)
        RS->>SB: SELECT limite
        SB-->>RS: Límite
        RS->>RS: Calcular porcentajeUso
        RS->>SB: Verificar si ya existe recompensa
        SB-->>RS: Resultado
        
        alt No existe y porcentajeUso <= 0.8
            RS->>RS: puntos = 100
            RS->>SB: INSERT recompensa
            SB->>DB: Crear recompensa
            DB-->>SB: Recompensa creada
        else No existe y porcentajeUso <= 1.0
            RS->>RS: puntos = 50
            RS->>SB: INSERT recompensa
            SB->>DB: Crear recompensa
            DB-->>SB: Recompensa creada
        end
        RS-->>UI: Recompensa otorgada (si aplica)
    end
    
    UI-->>U: Mostrar límites con estados
```

---

## Diagrama de Secuencia - Desbloquear Avatar

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as RecompensasTab
    participant RS as recompensasService
    participant SB as Supabase
    participant DB as Base de Datos

    U->>UI: Cambiar a vista "Tienda"
    UI->>RS: getRecompensas(userId)
    RS->>SB: SELECT recompensas
    SB-->>RS: Lista de recompensas
    RS-->>UI: Recompensas
    UI->>UI: Calcular puntos disponibles
    UI-->>U: Mostrar items disponibles
    
    U->>UI: Seleccionar avatar para desbloquear
    UI->>UI: Verificar puntos disponibles >= puntos requeridos
    alt Puntos suficientes
        UI->>U: Confirmar desbloqueo
        U->>UI: Confirmar
        UI->>RS: addRecompensa(userId, "desbloqueo_avatar_X", -puntos, titulo, descripcion)
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
```

---

## Diagrama de Secuencia - Consultar Chatbot

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as ChatbotTab
    participant GS as gastosService
    participant LS as limitesService
    participant RS as recompensasService
    participant SB as Supabase
    participant DB as Base de Datos

    U->>UI: Escribir mensaje (ej: "gastos")
    UI->>UI: processMessage(mensaje)
    
    alt Consulta sobre gastos
        UI->>GS: getGastos(userId)
        GS->>SB: SELECT gastos JOIN categorias
        SB->>DB: Query gastos
        DB-->>SB: Gastos
        SB-->>GS: Lista de gastos
        GS-->>UI: Gastos
        UI->>UI: Calcular total, promedio, cantidad
        UI->>UI: Analizar por categoría
        UI-->>U: Mostrar resumen de gastos
    else Consulta sobre límites
        UI->>LS: getAllLimites(userId)
        LS->>SB: SELECT limites
        SB-->>LS: Límites
        LS-->>UI: Límites
        UI->>UI: Encontrar límite activo
        UI->>UI: Calcular porcentaje usado
        UI-->>U: Mostrar estado del límite
    else Consulta sobre recompensas
        UI->>RS: getRecompensas(userId)
        RS->>SB: SELECT recompensas
        SB-->>RS: Recompensas
        RS-->>UI: Recompensas
        UI->>UI: Calcular puntos totales
        UI-->>U: Mostrar recompensas y puntos
    else Solicitar consejos
        UI->>LS: getAllLimites(userId)
        LS-->>UI: Límites
        UI->>UI: Generar consejos personalizados
        UI-->>U: Mostrar consejos de ahorro
    else Solicitar análisis
        UI->>GS: getGastos(userId)
        GS-->>UI: Gastos
        UI->>GS: getGastosByDateRange(userId, inicioMes, hoy)
        GS-->>UI: Gastos del mes
        UI->>UI: Calcular estadísticas
        UI->>UI: Analizar por categoría
        UI-->>U: Mostrar análisis detallado
    end
```

---

## Diagrama de Secuencia - Ver Estadísticas

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as HomeTab
    participant GS as gastosService
    participant SB as Supabase
    participant DB as Base de Datos

    U->>UI: Abrir pestaña Home
    UI->>GS: getGastos(userId)
    GS->>SB: SELECT gastos JOIN categorias WHERE user_id = ?
    SB->>DB: Query gastos
    DB-->>SB: Lista de gastos con categorias
    SB-->>GS: Gastos
    GS-->>UI: Lista de gastos
    
    Note over UI: Procesar datos para estadísticas
    UI->>UI: Calcular total gastado = SUM(monto)
    UI->>UI: Calcular promedio = total / cantidad
    UI->>UI: Contar total de gastos
    
    Note over UI: Procesar por categoría
    UI->>UI: Agrupar gastos por categoría
    UI->>UI: Sumar montos por categoría
    UI->>UI: Calcular porcentajes
    
    Note over UI: Procesar por mes (últimos 6 meses)
    UI->>UI: Filtrar gastos de últimos 6 meses
    UI->>UI: Agrupar por mes
    UI->>UI: Sumar montos por mes
    
    Note over UI: Procesar por día (últimos 7 días)
    UI->>UI: Filtrar gastos de últimos 7 días
    UI->>UI: Agrupar por día
    UI->>UI: Sumar montos por día
    
    UI-->>U: Mostrar:
    Note over U: - Resumen (total, promedio, cantidad)
    Note over U: - Gráfica de pastel por categoría
    Note over U: - Gráfica de barras por mes
    Note over U: - Gráfica de línea por día
```

---

## Diagrama de Secuencia - Seleccionar Avatar

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as RecompensasTab
    participant HS as HomeScreen
    participant RS as recompensasService
    participant SB as Supabase
    participant DB as Base de Datos

    U->>UI: Seleccionar avatar desbloqueado
    UI->>UI: Verificar si está desbloqueado
    alt Avatar desbloqueado
        UI->>UI: Actualizar estado local (avatarSeleccionado)
        UI->>HS: onAvatarUpdated(avatarId)
        HS->>HS: Actualizar avatarSeleccionado
        HS->>HS: Actualizar avatar en perfil
        HS-->>U: Avatar seleccionado y mostrado en perfil
    else Avatar no desbloqueado
        UI-->>U: Error: Debes desbloquear el avatar primero
    end
```

---

**Última actualización**: 2024
**Versión del documento**: 1.0

