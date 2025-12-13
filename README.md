# 📱 TODO List - Aplicación Móvil con Backend

**Evaluación 3 - Desarrollo de Aplicaciones Móviles**  
Instituto Profesional San Sebastián

## 👥 Integrantes del Equipo

- **José Antonio Jara Canales** - jose.jara.canales@estudiante.ipss.cl  
- **Raúl Veloso Ortiz** - raul.veloso.ortiz@estudiante.ipss.cl
- **Adolfo Campos Gómez** - Adolfo.campos.gomez@estudiante.ipss.cl


---

## 🆕 Cambios Evaluación 3 (Backend Integration)

### 🔐 Autenticación con Backend
- **Login/Registro** conectado a API REST
- **JWT Token** guardado en AsyncStorage para persistencia de sesión
- **Rutas protegidas** que requieren autenticación
- **Manejo de errores** HTTP (401, 400, 500, etc.)
- **Cierre de sesión** con limpieza de token

### 🌐 CRUD 100% en Backend
- **GET /todos**: Listar todas las tareas del usuario autenticado
- **POST /todos**: Crear nueva tarea con imagen y ubicación
- **PATCH /todos/:id**: Actualizar tarea (completar, editar, etc.)
- **DELETE /todos/:id**: Eliminar tarea del servidor
- Las tareas están asociadas al usuario autenticado mediante token JWT

### 📤 Envío de Imágenes
- Subida mediante **multipart/form-data** a `/images`
- El backend almacena en **Cloudflare R2**
- Devuelve URL pública de la imagen
- Las imágenes se asocian automáticamente a las tareas
- Máximo 5MB por imagen (JPEG, PNG, WebP, GIF)

### ⚙️ Variables de Entorno
- Archivo `.env` con `EXPO_PUBLIC_API_URL`
- Configuración centralizada de la URL del backend
- Backend utilizado: `https://todo-list.dobleb.cl`

---

## 🎨 Características del Diseño

Esta aplicación presenta un **diseño oscuro profesional** con:

- 🌑 **Tema Oscuro Premium**: Gradiente de negro puro a azul marino oscuro
- ✨ **Glassmorphism**: Tarjetas semi-transparentes con efecto vidrio esmerilado
- 💎 **Glow Effects**: Sombras azules brillantes en elementos interactivos
- 🎯 **Contraste Alto**: Textos blancos sobre fondos oscuros para máxima legibilidad
- 🔵 **Acentos Vibrantes**: Azul brillante (#3B82F6) para botones y elementos activos

---

## 🚀 Funcionalidades Implementadas

### ✅ Gestión Completa de Tareas (Backend)
- **Crear tareas** con título, descripción, foto y ubicación GPS
- **Editar tareas** existentes desde el servidor
- **Eliminar tareas** con confirmación
- **Marcar como completadas/pendientes** actualiza en backend
- **Filtros**: Ver todas, solo pendientes, o solo completadas
- **Estadísticas en tiempo real**: Total, pendientes y completadas
- **Pull to refresh** para sincronizar con servidor

### 📸 Captura de Imágenes
- Tomar fotos con la **cámara**
- Seleccionar desde la **galería**
- Conversión a **base64** para envío al servidor
- Almacenamiento en servidor con URL devuelta

### 📍 Geolocalización
- Captura **automática de ubicación** al crear tareas
- Opción de captura **manual** de ubicación
- **Reverse geocoding**: Convierte coordenadas en direcciones legibles
- Coordenadas enviadas al backend (latitude, longitude)

### 👤 Autenticación de Usuarios
- **Login** con credenciales contra backend
- **Registro** de nuevos usuarios
- **Persistencia de sesión** con token en AsyncStorage
- **Cierre de sesión** con limpieza de datos
- Cada usuario ve **solo sus propias tareas**
- Datos aislados por token de autenticación

### 💾 Persistencia
- **Token en AsyncStorage**: Mantiene sesión activa
- **Datos en Backend**: Todas las tareas se almacenan en el servidor
- **Sincronización**: Pull to refresh para actualizar desde backend

---

## 🛠️ Tecnologías Utilizadas

### Core
- **React Native** con Expo
- **TypeScript** para type safety
- **Expo Router** para navegación

### Bibliotecas Principales
- `@react-native-async-storage/async-storage` - Persistencia de token
- `expo-image-picker` - Captura de fotos (cámara y galería)
- `expo-location` - Geolocalización y geocoding
- `expo-file-system` - Conversión de imágenes a base64
- `expo-constants` - Manejo de variables de entorno
- `@expo/vector-icons` - Iconografía Material Design

### Backend API
- **URL Base**: `https://todo-list.dobleb.cl`
- **Autenticación**: JWT Bearer Token
- **Endpoints**:
  - `POST /auth/login` - Iniciar sesión
  - `POST /auth/register` - Registrar usuario
  - `GET /todos` - Listar tareas del usuario
  - `POST /todos` - Crear tarea
  - `PATCH /todos/:id` - Actualizar tarea
  - `DELETE /todos/:id` - Eliminar tarea
  - `POST /images` - Subir imagen (multipart/form-data)

### Arquitectura
- **Context API** para estado global (usuario + autenticación)
- **Servicios API** centralizados en `apiService.ts`
- **Manejo de errores HTTP** con mensajes descriptivos
- **Componentes reutilizables**
- **TypeScript interfaces** para modelos de datos

---

## 📁 Estructura del Proyecto

```
TodoList/
├── .env                      # Variables de entorno (API URL)
├── app/                      # Pantallas de la aplicación
│   ├── (tabs)/              
│   │   ├── index.tsx        # Home: Lista de tareas del backend
│   │   ├── perfil.tsx       # Perfil y logout
│   │   └── _layout.tsx      # Navegación de tabs
│   ├── login.tsx            # Login/Registro con API
│   ├── index.tsx            # Redirección inicial
│   └── _layout.tsx          # Layout raíz con protección de rutas
├── components/              # Componentes reutilizables
│   ├── TaskItem.tsx         # Item individual de tarea
│   ├── TaskForm.tsx         # Formulario con envío a API
│   └── EmptyState.tsx       # Estado vacío
├── context/                 # Contextos de React
│   └── UserContext.tsx      # Auth + token management
├── services/                # Capa de servicios
│   ├── apiService.ts        # API REST + Auth (NUEVO)
│   ├── storageService.ts    # (Deprecado - solo token ahora)
│   ├── fileService.ts       # Conversión base64
│   └── locationService.ts   # Servicios de ubicación
├── types/                   # Definiciones TypeScript
│   └── Task.ts             # Interfaces Task actualizadas
└── package.json
```

---

## 🎯 Testing de la Aplicación

Puedes crear usuarios nuevos o usar credenciales de prueba:

| Acción     | Email                                              | Contraseña |
|------------|----------------------------------------------------|------------|
| Registrar  | cualquier_email@ejemplo.com                        | mínimo 4 caracteres |
| JOSE       | jose.jara.canales@estudiante.ipss.cl              | 1234       |
| RAUL       | raul.veloso.ortiz@estudiante.ipss.cl              | 1234       |
| ADOLFO     | Adolfo.campos.gomez@estudiante.ipss.cl            | 1234       |

---

## 📦 Instalación y Ejecución

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Expo CLI
- Dispositivo físico o emulador (iOS/Android)
- Conexión a Internet (para conectar con backend)

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/jjaracanales/Desarrollo_aplicaciones_moviles_evaluacion2.git
cd Desarrollo_aplicaciones_moviles_evaluacion2

# 2. Instalar dependencias
npm install --legacy-peer-deps

# 3. Verificar archivo .env (ya incluido)
# EXPO_PUBLIC_API_URL=https://todo-list.dobleb.cl

# 4. Iniciar el servidor de desarrollo
npm start

# 5. Escanear QR con Expo Go (móvil) o presionar:
# - i para iOS simulator
# - a para Android emulator
```

### Permisos Necesarios

La aplicación solicitará los siguientes permisos al usuario:

**iOS**:
- Cámara
- Biblioteca de fotos
- Ubicación mientras está en uso

**Android**:
- Cámara
- Leer almacenamiento externo  
- Ubicación precisa
- Acceso a Internet

---

## 🎨 Paleta de Colores

```javascript
// Fondos
backgroundColor: '#000000'              // Negro puro
backgroundColor: '#0A0E1A'              // Azul oscuro/negro
backgroundColor: 'rgba(255,255,255,0.05)' // Glassmorphism

// Acentos
color: '#3B82F6'                        // Azul brillante (botones)
color: '#60A5FA'                        // Azul claro (textos secundarios)

// Textos
color: '#FFFFFF'                        // Blanco (textos principales)
color: '#94A3B8'                        // Gris azulado (textos secundarios)

// Bordes y divisores
borderColor: 'rgba(255,255,255,0.1)'   // Semi-transparente

// Estados
backgroundColor: '#10B981'              // Verde (completadas)
color: '#DC2626'                        // Rojo (eliminar)
```

---

## 📱 Capturas de Pantalla

La aplicación presenta:
1. **Login** con gradiente oscuro y usuarios rápidos
2. **Home/Tareas** con tarjetas glassmorphic y filtros
3. **TaskForm** modal para crear/editar con glassmorphism
4. **Perfil** con información del usuario y equipo

---

## 🔄 Flujo de Trabajo

### Registro/Login
1. Abrir app → Pantalla de Login
2. **Opción 1**: Registrar nuevo usuario (email + contraseña)
3. **Opción 2**: Iniciar sesión con credenciales existentes
4. Token se guarda automáticamente en AsyncStorage
5. Redirección a pantalla principal

### Crear Tarea
1. Tap en botón flotante **+**
2. Ingresar título (requerido)
3. Agregar descripción opcional (máx 500 caracteres)
4. Tomar foto o seleccionar de galería (opcional)
   - Se convierte a base64 automáticamente
5. Capturar ubicación manualmente o dejar que se capture automáticamente
6. Guardar → Se envía al backend
7. Lista se actualiza con la nueva tarea

### Editar Tarea
1. Tap en icono **lápiz azul** de la tarea
2. Modificar título, descripción, foto o ubicación
3. Actualizar → PATCH al backend
4. Lista se sincroniza

### Completar/Eliminar
- **Completar**: Tap en checkbox → PATCH al backend
- **Eliminar**: Tap en icono basura → Confirmación → DELETE al backend

### Cerrar Sesión
1. Ir a tab **Perfil**
2. Tap en "Cerrar sesión"
3. Confirmar → Token se elimina → Redirección a Login

---

## 🧪 Testing

### Casos de Prueba Principales

1. ✅ Registro de nuevo usuario con backend
2. ✅ Login con credenciales válidas
3. ✅ Persistencia de sesión (token en AsyncStorage)
4. ✅ Crear tarea con foto y ubicación → Enviada a backend
5. ✅ Editar tarea existente → Actualizada en backend
6. ✅ Marcar como completada/pendiente → PATCH al backend
7. ✅ Filtrar tareas por estado
8. ✅ Eliminar tarea → DELETE del backend
9. ✅ Pull-to-refresh para sincronizar con servidor
10. ✅ Multi-usuario (cada usuario ve solo sus tareas)
11. ✅ Manejo de errores HTTP (401, 400, 500)
12. ✅ Cierre de sesión y limpieza de token


---

## 🏆 Evaluación 3 - Criterios Cumplidos

- [x] **Autenticación contra backend** (login/registro)
- [x] **Token persistente** en AsyncStorage
- [x] **Rutas protegidas** con verificación de autenticación
- [x] **CRUD 100% en backend** (GET, POST, PATCH, DELETE)
- [x] **Manejo de imágenes** (conversión base64 + envío al servidor)
- [x] **Variables de entorno** (.env con API_URL)
- [x] **Manejo de errores HTTP** (401, 400, 500)
- [x] **Tareas asociadas al usuario** (mediante token)
- [x] **Arquitectura limpia** (servicios API separados)
- [x] **TypeScript** en todo el proyecto
- [x] **Documentación completa** (README actualizado)

### Cambios vs Evaluación 2
- ❌ ~~Persistencia local de tareas~~ → ✅ **Backend REST API**
- ❌ ~~Usuarios predefinidos~~ → ✅ **Autenticación real con JWT**
- ❌ ~~AsyncStorage para tareas~~ → ✅ **Solo token, tareas en servidor**
- ✅ **Mismas funcionalidades** (foto, ubicación, CRUD, filtros)

---

## 🤖 Uso de Inteligencia Artificial

### GitHub Copilot
- **Autocomplete de código**: Sugerencias de código TypeScript/React Native
- **Documentación**: Comentarios JSDoc en funciones complejas
- **Refactorización**: Mejoras en estructura de componentes

### ChatGPT/Claude (Asistente)
- **Migración a backend**: Consultas sobre integración de API REST
- **Manejo de errores**: Patrones de try-catch y mensajes de error
- **Conversión base64**: Implementación de envío de imágenes
- **TypeScript interfaces**: Definición de tipos para API responses
- **Documentación**: Estructura y contenido del README

### Declaración
El equipo utilizó herramientas de IA como **asistentes de desarrollo**, pero:
- ✅ Todo el código fue **revisado y comprendido** por los integrantes
- ✅ Las decisiones de **arquitectura** fueron tomadas por el equipo
- ✅ El **diseño UI/UX** es original del equipo
- ✅ La **lógica de negocio** fue implementada por los integrantes
- ✅ Las **pruebas y debugging** fueron realizadas manualmente

---

## 👥 Roles del Equipo

| Integrante | Rol Principal | Contribuciones |
|------------|---------------|----------------|
| **José Jara** | Backend Integration & Lead | Servicios API, autenticación, manejo de errores, arquitectura |
| **Raúl Veloso** | Mobile Features | Cámara, geolocalización, permisos nativos |
| **Adolfo Campos** | Testing & QA | Pruebas funcionales, documentación, validación |

**Nota**: Todos los integrantes participaron en la implementación general y tienen commits en el repositorio.


---

## 📄 Licencia

Proyecto académico - Instituto Profesional San Sebastián © 2025

---

## 📞 Contacto

Para consultas sobre este proyecto, contactar a cualquiera de los integrantes a través de sus emails institucionales.
