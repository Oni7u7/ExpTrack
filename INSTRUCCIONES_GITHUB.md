# 📦 Cómo Visualizar Diagramas en GitHub

Esta guía te ayudará a subir los archivos de diagramas a GitHub para visualizarlos automáticamente.

## 🚀 Pasos para Subir a GitHub

### Opción 1: Si ya tienes un repositorio en GitHub

1. **Asegúrate de tener Git configurado**:
   ```bash
   git status
   ```

2. **Agrega los archivos de diagramas**:
   ```bash
   git add DIAGRAMAS_*.md GUIA_VISUALIZAR_DIAGRAMAS.md
   ```

3. **Haz commit**:
   ```bash
   git commit -m "Agregar diagramas de casos de uso y secuencias"
   ```

4. **Sube a GitHub**:
   ```bash
   git push origin main
   ```
   (o `git push origin master` si tu rama principal se llama master)

5. **Visualiza en GitHub**:
   - Ve a tu repositorio en GitHub
   - Navega a los archivos `.md`
   - Haz clic en cualquier archivo (ej: `DIAGRAMAS_SECUENCIA_USUARIO.md`)
   - Los diagramas se renderizarán automáticamente

---

### Opción 2: Si NO tienes un repositorio en GitHub

#### Paso 1: Crear repositorio en GitHub

1. Ve a **https://github.com**
2. Inicia sesión (o crea una cuenta)
3. Haz clic en el botón **"+"** (arriba a la derecha) → **"New repository"**
4. Completa:
   - **Repository name**: `ExpTrack` (o el nombre que prefieras)
   - **Description**: "Aplicación de seguimiento de gastos"
   - **Visibility**: Público o Privado (tu elección)
   - ⚠️ **NO marques** "Initialize with README" (ya tienes archivos)
5. Haz clic en **"Create repository"**

#### Paso 2: Conectar tu proyecto local con GitHub

1. **Abre tu terminal en la carpeta del proyecto**:
   ```bash
   cd /home/diego-onii/ExpTrack
   ```

2. **Inicializa Git (si no está inicializado)**:
   ```bash
   git init
   ```

3. **Agrega el remoto de GitHub**:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/ExpTrack.git
   ```
   (Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub)

4. **Agrega todos los archivos**:
   ```bash
   git add .
   ```

5. **Haz el primer commit**:
   ```bash
   git commit -m "Initial commit: Agregar proyecto ExpTrack con diagramas"
   ```

6. **Sube a GitHub**:
   ```bash
   git branch -M main
   git push -u origin main
   ```

#### Paso 3: Visualizar los diagramas

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/ExpTrack`
2. Navega a los archivos de diagramas:
   - `DIAGRAMAS_CASOS_USO_SECUENCIAS.md`
   - `DIAGRAMAS_CASO_USO_USUARIO.md`
   - `DIAGRAMAS_SECUENCIA_USUARIO.md`
   - etc.
3. Haz clic en cualquier archivo
4. **¡Los diagramas se renderizarán automáticamente!** 🎉

---

## 📁 Archivos que debes subir

Asegúrate de subir estos archivos para ver todos los diagramas:

- ✅ `DIAGRAMAS_CASOS_USO_SECUENCIAS.md`
- ✅ `DIAGRAMAS_CASO_USO_USUARIO.md`
- ✅ `DIAGRAMAS_CASO_USO_ADMINISTRADOR.md`
- ✅ `DIAGRAMAS_SECUENCIA_USUARIO.md`
- ✅ `DIAGRAMAS_SECUENCIA_ADMINISTRADOR.md`
- ✅ `GUIA_VISUALIZAR_DIAGRAMAS.md` (opcional, pero útil)

---

## 🎯 Ejemplo de Visualización

Una vez subido, cuando abras un archivo en GitHub verás algo así:

```markdown
## Diagrama de Secuencia - Agregar Gasto

[El diagrama se renderiza automáticamente aquí]
```

GitHub renderiza automáticamente los diagramas Mermaid sin necesidad de extensiones adicionales.

---

## 🔍 Verificación

Para verificar que todo está bien:

1. **Revisa que los archivos estén en GitHub**:
   - Ve a tu repositorio
   - Deberías ver los archivos `.md` listados

2. **Abre un archivo de diagramas**:
   - Haz clic en `DIAGRAMAS_SECUENCIA_USUARIO.md`
   - Deberías ver el diagrama renderizado

3. **Si no ves el diagrama**:
   - Verifica que el código esté entre ````mermaid` y ```` `
   - Asegúrate de que no haya errores de sintaxis
   - GitHub puede tardar unos segundos en renderizar

---

## 💡 Consejos

1. **Organización**: Puedes crear una carpeta `docs/` o `diagramas/` para organizar mejor:
   ```bash
   mkdir docs
   mv DIAGRAMAS_*.md docs/
   git add docs/
   git commit -m "Organizar diagramas en carpeta docs"
   git push
   ```

2. **README**: Puedes agregar enlaces a los diagramas en tu `README.md`:
   ```markdown
   ## 📊 Diagramas
   - [Casos de Uso y Secuencias](./DIAGRAMAS_CASOS_USO_SECUENCIAS.md)
   - [Casos de Uso Usuario](./DIAGRAMAS_CASO_USO_USUARIO.md)
   - [Secuencias Usuario](./DIAGRAMAS_SECUENCIA_USUARIO.md)
   ```

3. **Vista previa local**: Si quieres ver cómo se verá en GitHub antes de subir:
   - Usa Mermaid Live Editor: https://mermaid.live
   - O instala una extensión de VS Code

---

## 🆘 Solución de Problemas

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/ExpTrack.git
```

### Error: "failed to push"
```bash
# Si es la primera vez, usa:
git push -u origin main

# Si ya existe, usa:
git pull origin main --allow-unrelated-histories
git push origin main
```

### Los diagramas no se muestran
- ✅ Verifica que el código esté correctamente formateado
- ✅ Asegúrate de que GitHub haya procesado el archivo (espera unos segundos)
- ✅ Prueba refrescando la página
- ✅ Verifica que el archivo tenga extensión `.md`

---

## 📚 Recursos Adicionales

- **Documentación de GitHub sobre Mermaid**: https://github.blog/2022-02-14-include-diagrams-markdown-files-mermaid/
- **Sintaxis Mermaid**: https://mermaid.js.org
- **Guía de Git**: https://git-scm.com/doc

---

**¡Listo! Una vez subido, podrás ver todos tus diagramas renderizados en GitHub.** 🎨

