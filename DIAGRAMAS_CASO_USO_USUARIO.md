# Diagramas de Caso de Uso - Usuario

Este documento contiene los diagramas de casos de uso específicos para el rol de Usuario en el sistema ExpTrack.

## 📋 Índice

1. [Diagrama General de Casos de Uso de Usuario](#diagrama-general-de-casos-de-uso-de-usuario)
2. [Casos de Uso de Autenticación](#casos-de-uso-de-autenticación)
3. [Casos de Uso de Gestión de Gastos](#casos-de-uso-de-gestión-de-gastos)
4. [Casos de Uso de Sistema de Límites](#casos-de-uso-de-sistema-de-límites)
5. [Casos de Uso de Sistema de Recompensas](#casos-de-uso-de-sistema-de-recompensas)
6. [Casos de Uso de Chatbot](#casos-de-uso-de-chatbot)
7. [Casos de Uso de Perfil](#casos-de-uso-de-perfil)

---

## Diagrama General de Casos de Uso de Usuario

```mermaid
graph TB
    Usuario[Usuario]
    
    subgraph Autenticación["🔐 Autenticación"]
        UC1[Registrarse]
        UC2[Iniciar Sesión]
        UC3[Cerrar Sesión]
    end
    
    subgraph Gastos["💰 Gestión de Gastos"]
        UC4[Agregar Gasto]
        UC5[Ver Historial de Gastos]
        UC6[Eliminar Gasto]
        UC7[Ver Estadísticas y Gráficas]
        UC8[Filtrar Gastos por Categoría]
        UC9[Ver Resumen de Gastos]
    end
    
    subgraph Limites["🎯 Sistema de Límites"]
        UC10[Establecer Límite de Gastos]
        UC11[Ver Límites Activos]
        UC12[Ver Límites Concluidos]
        UC13[Calcular Límite desde Gastos Anteriores]
        UC14[Ver Progreso del Límite]
    end
    
    subgraph Recompensas["🏆 Sistema de Recompensas"]
        UC15[Ver Recompensas Obtenidas]
        UC16[Ver Puntos Disponibles]
        UC17[Desbloquear Avatar]
        UC18[Seleccionar Avatar]
        UC19[Ver Tienda de Desbloqueos]
    end
    
    subgraph Chatbot["🤖 Chatbot Inteligente"]
        UC20[Consultar Gastos vía Chatbot]
        UC21[Consultar Límites vía Chatbot]
        UC22[Obtener Consejos de Ahorro]
        UC23[Ver Análisis de Gastos]
        UC24[Consultar Recompensas vía Chatbot]
    end
    
    subgraph Perfil["👤 Perfil"]
        UC25[Ver Perfil]
        UC26[Ver Información Personal]
        UC27[Ver Avatar Seleccionado]
    end
    
    Usuario --> Autenticación
    Usuario --> Gastos
    Usuario --> Limites
    Usuario --> Recompensas
    Usuario --> Chatbot
    Usuario --> Perfil
    
    style Usuario fill:#5B715B,stroke:#333,stroke-width:3px,color:#fff
    style Autenticación fill:#E8F5E9,stroke:#4CAF50,stroke-width:2px
    style Gastos fill:#E3F2FD,stroke:#2196F3,stroke-width:2px
    style Limites fill:#FFF3E0,stroke:#FF9800,stroke-width:2px
    style Recompensas fill:#F3E5F5,stroke:#9C27B0,stroke-width:2px
    style Chatbot fill:#E0F2F1,stroke:#009688,stroke-width:2px
    style Perfil fill:#FAFAFA,stroke:#757575,stroke-width:2px
```

---

## Casos de Uso de Autenticación

```mermaid
graph LR
    Usuario[Usuario]
    
    UC1[Registrarse]
    UC2[Iniciar Sesión]
    UC3[Cerrar Sesión]
    
    Usuario -->|Ingresar nombre, email, password| UC1
    Usuario -->|Ingresar email, password| UC2
    Usuario -->|Clic en cerrar sesión| UC3
    
    UC1 -->|Validar campos| V1{Validación}
    V1 -->|Válido| R1[Crear cuenta]
    V1 -->|Inválido| E1[Mostrar error]
    
    UC2 -->|Validar credenciales| V2{Autenticación}
    V2 -->|Correcto| R2[Iniciar sesión]
    V2 -->|Incorrecto| E2[Mostrar error]
    
    UC3 -->|Limpiar sesión| R3[Redirigir a login]
    
    style Usuario fill:#5B715B,stroke:#333,stroke-width:2px,color:#fff
    style UC1 fill:#C8E6C9,stroke:#4CAF50
    style UC2 fill:#C8E6C9,stroke:#4CAF50
    style UC3 fill:#C8E6C9,stroke:#4CAF50
    style V1 fill:#FFF9C4,stroke:#FBC02D
    style V2 fill:#FFF9C4,stroke:#FBC02D
    style R1 fill:#A5D6A7,stroke:#4CAF50
    style R2 fill:#A5D6A7,stroke:#4CAF50
    style R3 fill:#A5D6A7,stroke:#4CAF50
    style E1 fill:#EF9A9A,stroke:#F44336
    style E2 fill:#EF9A9A,stroke:#F44336
```

### Descripción de Casos de Uso - Autenticación

#### UC1: Registrarse
- **Actor**: Usuario
- **Precondición**: No tener cuenta activa
- **Flujo Principal**:
  1. Usuario ingresa nombre, email y contraseña
  2. Sistema valida formato de email
  3. Sistema valida que el email no esté registrado
  4. Sistema hashea la contraseña
  5. Sistema crea el usuario en la base de datos
  6. Sistema muestra mensaje de éxito
  7. Sistema redirige a la pantalla principal
- **Flujo Alternativo**: Si el email ya existe, mostrar error
- **Postcondición**: Usuario registrado y autenticado

#### UC2: Iniciar Sesión
- **Actor**: Usuario
- **Precondición**: Tener cuenta registrada
- **Flujo Principal**:
  1. Usuario ingresa email y contraseña
  2. Sistema busca usuario por email
  3. Sistema compara contraseña hasheada
  4. Si coincide, inicia sesión
  5. Sistema redirige a la pantalla principal
- **Flujo Alternativo**: Si las credenciales son incorrectas, mostrar error
- **Postcondición**: Usuario autenticado

#### UC3: Cerrar Sesión
- **Actor**: Usuario
- **Precondición**: Estar autenticado
- **Flujo Principal**:
  1. Usuario confirma cerrar sesión
  2. Sistema limpia datos de sesión
  3. Sistema redirige a pantalla de login
- **Postcondición**: Usuario desautenticado

---

## Casos de Uso de Gestión de Gastos

```mermaid
graph TB
    Usuario[Usuario]
    
    UC4[Agregar Gasto]
    UC5[Ver Historial de Gastos]
    UC6[Eliminar Gasto]
    UC7[Ver Estadísticas y Gráficas]
    
    Usuario --> UC4
    Usuario --> UC5
    Usuario --> UC6
    Usuario --> UC7
    
    UC4 -->|Completar formulario| F1[Monto, Categoría, Descripción, Fecha]
    F1 -->|Guardar| V3{Validar monto > 0}
    V3 -->|Válido| R4[Gasto creado]
    V3 -->|Inválido| E3[Error: monto inválido]
    R4 -->|Actualizar límites| A1[Actualizar gasto_total en límites]
    
    UC5 -->|Cargar| R5[Mostrar lista de gastos]
    R5 -->|Ordenar| O1[Por fecha descendente]
    
    UC6 -->|Seleccionar gasto| C1{Confirmar eliminación}
    C1 -->|Confirmar| R6[Gasto eliminado]
    C1 -->|Cancelar| E4[Operación cancelada]
    R6 -->|Actualizar límites| A2[Recalcular gasto_total]
    
    UC7 -->|Calcular| C2[Total, Promedio, Cantidad]
    C2 -->|Gráficas| G1[Pastel por categoría]
    C2 -->|Gráficas| G2[Barras por mes]
    C2 -->|Gráficas| G3[Línea por día]
    
    style Usuario fill:#5B715B,stroke:#333,stroke-width:2px,color:#fff
    style UC4 fill:#BBDEFB,stroke:#2196F3
    style UC5 fill:#BBDEFB,stroke:#2196F3
    style UC6 fill:#BBDEFB,stroke:#2196F3
    style UC7 fill:#BBDEFB,stroke:#2196F3
```

### Descripción de Casos de Uso - Gestión de Gastos

#### UC4: Agregar Gasto
- **Actor**: Usuario
- **Precondición**: Estar autenticado
- **Flujo Principal**:
  1. Usuario abre modal de agregar gasto
  2. Usuario ingresa monto (obligatorio)
  3. Usuario selecciona categoría (opcional)
  4. Usuario ingresa descripción (opcional)
  5. Usuario selecciona fecha (por defecto: hoy)
  6. Usuario guarda el gasto
  7. Sistema valida monto > 0
  8. Sistema crea el gasto en la base de datos
  9. Sistema actualiza gasto_total en límites afectados
  10. Sistema muestra mensaje de éxito
  11. Si se excedió el límite, mostrar alerta especial
- **Flujo Alternativo**: Si monto es inválido, mostrar error
- **Postcondición**: Gasto creado y límites actualizados

#### UC5: Ver Historial de Gastos
- **Actor**: Usuario
- **Precondición**: Estar autenticado
- **Flujo Principal**:
  1. Usuario abre pestaña Historial
  2. Sistema carga todos los gastos del usuario
  3. Sistema ordena por fecha descendente
  4. Sistema muestra lista con: monto, categoría, descripción, fecha
  5. Usuario puede hacer pull-to-refresh para actualizar
- **Postcondición**: Historial mostrado

#### UC6: Eliminar Gasto
- **Actor**: Usuario
- **Precondición**: Tener gastos registrados
- **Flujo Principal**:
  1. Usuario selecciona gasto a eliminar
  2. Sistema muestra confirmación
  3. Usuario confirma eliminación
  4. Sistema elimina el gasto
  5. Sistema recalcula gasto_total en límites afectados
  6. Sistema actualiza la lista
- **Flujo Alternativo**: Si cancela, no se elimina
- **Postcondición**: Gasto eliminado y límites actualizados

#### UC7: Ver Estadísticas y Gráficas
- **Actor**: Usuario
- **Precondición**: Tener gastos registrados
- **Flujo Principal**:
  1. Usuario abre pestaña Home
  2. Sistema calcula total gastado
  3. Sistema calcula promedio por gasto
  4. Sistema cuenta total de gastos
  5. Sistema genera gráfica de pastel por categoría
  6. Sistema genera gráfica de barras por mes (últimos 6 meses)
  7. Sistema genera gráfica de línea por día (últimos 7 días)
  8. Sistema muestra todas las estadísticas
- **Postcondición**: Estadísticas y gráficas mostradas

---

## Casos de Uso de Sistema de Límites

```mermaid
graph TB
    Usuario[Usuario]
    
    UC10[Establecer Límite de Gastos]
    UC11[Ver Límites Activos]
    UC12[Ver Límites Concluidos]
    UC13[Calcular Límite desde Gastos Anteriores]
    UC14[Ver Progreso del Límite]
    
    Usuario --> UC10
    Usuario --> UC11
    Usuario --> UC12
    Usuario --> UC13
    Usuario --> UC14
    
    UC10 -->|Ingresar datos| F2[Monto, Fecha Inicio, Fecha Fin]
    F2 -->|Validar| V4{Fechas válidas}
    V4 -->|Válido| R7[Límite creado]
    V4 -->|Inválido| E5[Error: fechas inválidas]
    R7 -->|Calcular| C3[Gasto total del período]
    
    UC13 -->|Calcular| C4[Obtener gastos mes anterior]
    C4 -->|Sumar| S1[Total gastos anteriores]
    S1 -->|Sugerir| R8[Monto sugerido]
    
    UC14 -->|Mostrar| P1[Barra de progreso]
    P1 -->|Colores| CL1[Verde: <50%, Amarillo: 50-80%, Rojo: >80%]
    
    style Usuario fill:#5B715B,stroke:#333,stroke-width:2px,color:#fff
    style UC10 fill:#FFE0B2,stroke:#FF9800
    style UC11 fill:#FFE0B2,stroke:#FF9800
    style UC12 fill:#FFE0B2,stroke:#FF9800
    style UC13 fill:#FFE0B2,stroke:#FF9800
    style UC14 fill:#FFE0B2,stroke:#FF9800
```

### Descripción de Casos de Uso - Sistema de Límites

#### UC10: Establecer Límite de Gastos
- **Actor**: Usuario
- **Precondición**: Estar autenticado
- **Flujo Principal**:
  1. Usuario abre pestaña Límite
  2. Usuario puede calcular límite desde gastos anteriores o ingresar manualmente
  3. Usuario ingresa monto límite
  4. Usuario selecciona fecha de inicio y fin
  5. Sistema valida que fecha inicio < fecha fin
  6. Sistema crea el límite
  7. Sistema calcula gasto_total inicial del período
  8. Sistema muestra límite creado
- **Flujo Alternativo**: Si fechas son inválidas, mostrar error
- **Postcondición**: Límite creado y activo

#### UC13: Calcular Límite desde Gastos Anteriores
- **Actor**: Usuario
- **Precondición**: Tener gastos en el mes anterior
- **Flujo Principal**:
  1. Usuario selecciona "Calcular desde gastos anteriores"
  2. Sistema obtiene gastos del mes anterior
  3. Sistema suma todos los gastos
  4. Sistema sugiere ese monto como límite
  5. Usuario puede ajustar el monto sugerido
  6. Usuario guarda el límite
- **Flujo Alternativo**: Si no hay gastos anteriores, sugerir ingresar manualmente
- **Postcondición**: Límite sugerido mostrado

---

## Casos de Uso de Sistema de Recompensas

```mermaid
graph TB
    Usuario[Usuario]
    
    UC15[Ver Recompensas Obtenidas]
    UC16[Ver Puntos Disponibles]
    UC17[Desbloquear Avatar]
    UC18[Seleccionar Avatar]
    UC19[Ver Tienda de Desbloqueos]
    
    Usuario --> UC15
    Usuario --> UC16
    Usuario --> UC17
    Usuario --> UC18
    Usuario --> UC19
    
    UC15 -->|Cargar| R9[Lista de recompensas]
    R9 -->|Mostrar| D1[Título, Puntos, Descripción, Fecha]
    
    UC16 -->|Calcular| C5[Puntos totales - Puntos gastados]
    C5 -->|Mostrar| R10[Puntos disponibles]
    
    UC17 -->|Seleccionar item| V5{Puntos suficientes?}
    V5 -->|Sí| C6{Confirmar}
    C6 -->|Confirmar| R11[Avatar desbloqueado]
    C6 -->|Cancelar| E6[Operación cancelada]
    V5 -->|No| E7[Error: puntos insuficientes]
    
    UC18 -->|Seleccionar| V6{Está desbloqueado?}
    V6 -->|Sí| R12[Avatar seleccionado]
    V6 -->|No| E8[Error: desbloquear primero]
    
    style Usuario fill:#5B715B,stroke:#333,stroke-width:2px,color:#fff
    style UC15 fill:#E1BEE7,stroke:#9C27B0
    style UC16 fill:#E1BEE7,stroke:#9C27B0
    style UC17 fill:#E1BEE7,stroke:#9C27B0
    style UC18 fill:#E1BEE7,stroke:#9C27B0
    style UC19 fill:#E1BEE7,stroke:#9C27B0
```

---

## Casos de Uso de Chatbot

```mermaid
graph TB
    Usuario[Usuario]
    
    UC20[Consultar Gastos vía Chatbot]
    UC21[Consultar Límites vía Chatbot]
    UC22[Obtener Consejos de Ahorro]
    UC23[Ver Análisis de Gastos]
    UC24[Consultar Recompensas vía Chatbot]
    
    Usuario --> UC20
    Usuario --> UC21
    Usuario --> UC22
    Usuario --> UC23
    Usuario --> UC24
    
    UC20 -->|Escribir| T1["gastos" o "cuánto gasté"]
    T1 -->|Procesar| P2[Obtener gastos del usuario]
    P2 -->|Calcular| C7[Total, Promedio, Cantidad]
    C7 -->|Responder| R13[Resumen de gastos]
    
    UC21 -->|Escribir| T2["límite" o "presupuesto"]
    T2 -->|Procesar| P3[Obtener límite activo]
    P3 -->|Calcular| C8[Porcentaje usado, Restante]
    C8 -->|Responder| R14[Estado del límite]
    
    UC22 -->|Escribir| T3["consejos" o "ahorro"]
    T3 -->|Procesar| P4[Generar consejos personalizados]
    P4 -->|Responder| R15[Lista de consejos]
    
    UC23 -->|Escribir| T4["análisis" o "estadísticas"]
    T4 -->|Procesar| P5[Calcular estadísticas]
    P5 -->|Responder| R16[Análisis detallado]
    
    style Usuario fill:#5B715B,stroke:#333,stroke-width:2px,color:#fff
    style UC20 fill:#B2DFDB,stroke:#009688
    style UC21 fill:#B2DFDB,stroke:#009688
    style UC22 fill:#B2DFDB,stroke:#009688
    style UC23 fill:#B2DFDB,stroke:#009688
    style UC24 fill:#B2DFDB,stroke:#009688
```

---

## Casos de Uso de Perfil

```mermaid
graph TB
    Usuario[Usuario]
    
    UC25[Ver Perfil]
    UC26[Ver Información Personal]
    UC27[Ver Avatar Seleccionado]
    
    Usuario --> UC25
    UC25 --> UC26
    UC25 --> UC27
    
    UC26 -->|Mostrar| I1[Nombre, Email]
    UC27 -->|Mostrar| I2[Avatar desbloqueado o iniciales]
    
    style Usuario fill:#5B715B,stroke:#333,stroke-width:2px,color:#fff
    style UC25 fill:#EEEEEE,stroke:#757575
    style UC26 fill:#EEEEEE,stroke:#757575
    style UC27 fill:#EEEEEE,stroke:#757575
```

---

## Relaciones entre Casos de Uso

```mermaid
graph TB
    UC4[Agregar Gasto] -.->|actualiza| UC14[Ver Progreso del Límite]
    UC6[Eliminar Gasto] -.->|actualiza| UC14[Ver Progreso del Límite]
    UC10[Establecer Límite] -.->|puede generar| UC15[Ver Recompensas Obtenidas]
    UC14[Ver Progreso del Límite] -.->|si cumple| UC15[Ver Recompensas Obtenidas]
    UC15[Ver Recompensas Obtenidas] -.->|permite| UC17[Desbloquear Avatar]
    UC17[Desbloquear Avatar] -.->|permite| UC18[Seleccionar Avatar]
    UC18[Seleccionar Avatar] -.->|se muestra en| UC27[Ver Avatar Seleccionado]
    
    style UC4 fill:#BBDEFB,stroke:#2196F3
    style UC6 fill:#BBDEFB,stroke:#2196F3
    style UC10 fill:#FFE0B2,stroke:#FF9800
    style UC14 fill:#FFE0B2,stroke:#FF9800
    style UC15 fill:#E1BEE7,stroke:#9C27B0
    style UC17 fill:#E1BEE7,stroke:#9C27B0
    style UC18 fill:#E1BEE7,stroke:#9C27B0
    style UC27 fill:#EEEEEE,stroke:#757575
```

---

**Última actualización**: 2024
**Versión del documento**: 1.0

