# 📊 Guía para Visualizar los Diagramas Mermaid

Esta guía te ayudará a visualizar los diagramas de casos de uso y secuencias creados para ExpTrack.

## 🚀 Opción 1: Mermaid Live Editor (Más Rápido - Recomendado)

### Pasos:
1. Abre tu navegador y ve a: **https://mermaid.live**
2. Abre uno de los archivos `.md` con los diagramas (ej: `DIAGRAMAS_SECUENCIA_USUARIO.md`)
3. Copia el código del diagrama que quieres ver (desde ````mermaid` hasta ```` `)
4. Pega el código en el editor de Mermaid Live
5. ¡El diagrama se renderizará automáticamente!

### Ejemplo:
```markdown
```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Interfaz
    ...
```
```

**Ventajas**: 
- ✅ No requiere instalación
- ✅ Funciona inmediatamente
- ✅ Puedes exportar como PNG o SVG
- ✅ Puedes editar y ver cambios en tiempo real

---

## 💻 Opción 2: VS Code con Extensión

### Instalación:
1. Abre VS Code
2. Ve a Extensiones (Ctrl+Shift+X o Cmd+Shift+X)
3. Busca e instala una de estas extensiones:
   - **"Markdown Preview Mermaid Support"** (por Matt Bierner)
   - **"Mermaid Preview"** (por vstirbu)
   - **"Markdown Preview Enhanced"** (por Yiyi Wang) - Más completo

### Uso:
1. Abre el archivo `.md` con los diagramas
2. Presiona `Ctrl+Shift+V` (Windows/Linux) o `Cmd+Shift+V` (Mac) para abrir la vista previa
3. Los diagramas se renderizarán automáticamente

**Ventajas**:
- ✅ Visualización integrada en tu editor
- ✅ No necesitas salir de VS Code
- ✅ Puedes editar y ver cambios en tiempo real

---

## 🌐 Opción 3: GitHub/GitLab

### Pasos:
1. Sube los archivos `.md` a tu repositorio en GitHub o GitLab
2. Abre el archivo en el navegador desde el repositorio
3. Los diagramas Mermaid se renderizarán automáticamente

**Ventajas**:
- ✅ No requiere instalación
- ✅ Compartible con tu equipo
- ✅ Visualización permanente en el repositorio

---

## 📱 Opción 4: Herramientas Online Alternativas

### Mermaid.ink (Generar imágenes)
- URL: **https://mermaid.ink**
- Convierte diagramas Mermaid en imágenes PNG/SVG
- Útil para incluir en documentos o presentaciones

### Kroki
- URL: **https://kroki.io**
- Soporta múltiples formatos de diagramas, incluyendo Mermaid

---

## 🖼️ Opción 5: Exportar como Imagen

### Desde Mermaid Live Editor:
1. Abre https://mermaid.live
2. Pega tu código del diagrama
3. Haz clic en "Actions" → "Download PNG" o "Download SVG"

### Desde VS Code (con Markdown Preview Enhanced):
1. Abre la vista previa del markdown
2. Click derecho en el diagrama
3. Selecciona "Save Image" o "Copy Image"

---

## 📝 Ejemplo Práctico

### Para ver el diagrama "Agregar Gasto":

1. **Abre el archivo**: `DIAGRAMAS_SECUENCIA_USUARIO.md`
2. **Busca la sección**: "Diagrama de Secuencia - Agregar Gasto"
3. **Copia el código** desde la línea que dice ````mermaid` hasta ```` `
4. **Pega en Mermaid Live**: https://mermaid.live
5. **¡Listo!** Verás el diagrama renderizado

### Código de ejemplo:
```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Interfaz
    participant AM as AddGastoModal
    ...
```

---

## 🔧 Solución de Problemas

### El diagrama no se muestra:
- ✅ Verifica que el código esté entre ````mermaid` y ```` `
- ✅ Asegúrate de que no haya errores de sintaxis
- ✅ Prueba copiando solo el código del diagrama (sin el markdown)

### En VS Code no se renderiza:
- ✅ Verifica que tengas la extensión instalada
- ✅ Reinicia VS Code después de instalar la extensión
- ✅ Prueba con "Markdown Preview Enhanced" que tiene mejor soporte

### El diagrama se ve mal:
- ✅ Algunos diagramas largos pueden necesitar ajustes
- ✅ Prueba en Mermaid Live Editor para verificar la sintaxis
- ✅ Revisa la documentación de Mermaid: https://mermaid.js.org

---

## 📚 Archivos con Diagramas

Los siguientes archivos contienen diagramas:

1. **DIAGRAMAS_CASOS_USO_SECUENCIAS.md** - Diagramas generales
2. **DIAGRAMAS_CASO_USO_USUARIO.md** - Casos de uso del usuario
3. **DIAGRAMAS_CASO_USO_ADMINISTRADOR.md** - No aplica (sin admin)
4. **DIAGRAMAS_SECUENCIA_USUARIO.md** - Secuencias del usuario
5. **DIAGRAMAS_SECUENCIA_ADMINISTRADOR.md** - No aplica (sin admin)

---

## 💡 Recomendación

**Para uso rápido**: Usa **Mermaid Live Editor** (https://mermaid.live)
- Es la forma más rápida de ver los diagramas
- No requiere instalación
- Puedes exportar las imágenes

**Para desarrollo**: Instala **Markdown Preview Enhanced** en VS Code
- Visualización integrada
- Puedes editar y ver cambios en tiempo real
- Mejor experiencia de desarrollo

---

## 🔗 Enlaces Útiles

- **Mermaid Live Editor**: https://mermaid.live
- **Documentación Mermaid**: https://mermaid.js.org
- **Mermaid.ink (Imágenes)**: https://mermaid.ink
- **Markdown Preview Enhanced**: https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced

---

**¡Disfruta visualizando tus diagramas!** 🎨

