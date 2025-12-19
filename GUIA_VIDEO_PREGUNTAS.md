# 📹 Guía para el Video de Preguntas Teóricas

**Evaluación Final - Desarrollo de Aplicaciones Móviles**

Cada integrante debe responder **UNA pregunta** mostrando el **código en pantalla**.

---

## 📋 Distribución de Preguntas

| Pregunta | Integrante Sugerido |
|----------|---------------------|
| 1. Estados en React | José Antonio Jara |
| 2. Aplicación Nativa | Raúl Veloso |
| 3. Servicio REST y Autenticación | Adolfo Campos |
| 4. Hooks y Custom Hooks | (Cualquiera de los 3) |

---

## 1️⃣ ¿Qué es un estado en React y cómo funciona?

### 📂 Archivos a mostrar:
- `app/login.tsx` (líneas 21-26)
- `app/(tabs)/index.tsx` (líneas 40-41)
- `components/TaskForm.tsx` (líneas 32-39)

### 💬 Respuesta sugerida:

> "Un **estado** en React es un objeto que contiene datos dinámicos que pueden cambiar durante el ciclo de vida del componente. Cuando el estado cambia, React automáticamente **re-renderiza** el componente para reflejar los nuevos valores en la interfaz."

### 🖥️ Código a mostrar (`app/login.tsx` líneas 21-26):

```typescript
// Estados locales del componente Login
const [email, setEmail] = useState<string>('');           // Estado para el email
const [password, setPassword] = useState<string>('');     // Estado para la contraseña
const [emailFocused, setEmailFocused] = useState<boolean>(false);
const [passwordFocused, setPasswordFocused] = useState<boolean>(false);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [isRegistering, setIsRegistering] = useState<boolean>(false);
```

### 📝 Puntos clave a mencionar:

1. **`useState`** es un Hook de React que permite agregar estado a componentes funcionales
2. Retorna un **array con 2 elementos**: el valor actual y una función para actualizarlo
3. **Ejemplo práctico**: 
   - `email` guarda lo que el usuario escribe
   - `setEmail` actualiza el valor cuando el usuario escribe
   - React re-renderiza el input mostrando el nuevo texto

### 🎯 Demostración práctica:
- Abrir la app y escribir en el campo de email
- Mostrar cómo el estado `email` se actualiza en tiempo real
- Mostrar cómo `isLoading` cambia a `true` al presionar el botón de login

---

## 2️⃣ ¿Qué significa que la aplicación sea nativa?

### 📂 Archivos a mostrar:
- `components/TaskForm.tsx` (líneas 77-124) - Cámara y Galería
- `services/locationService.ts` (completo) - Geolocalización

### 💬 Respuesta sugerida:

> "Una aplicación **nativa** es aquella que puede acceder a las funcionalidades del hardware y sistema operativo del dispositivo, como la **cámara**, **GPS**, **sistema de archivos**, etc. A diferencia de una web app que corre en el navegador, nuestra app usa **APIs nativas** a través de Expo."

### 🖥️ Código de Cámara (`components/TaskForm.tsx` líneas 102-124):

```typescript
// Tomar foto con la CÁMARA del dispositivo (API Nativa)
const handleTakePhoto = async () => {
    try {
        // Solicitar permiso de cámara al sistema operativo
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara');
            return;
        }

        // Abrir la cámara nativa del dispositivo
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    } catch (error) {
        console.error('Error taking photo:', error);
    }
};
```

### 🖥️ Código de Ubicación (`services/locationService.ts` líneas 21-65):

```typescript
// Obtener ubicación GPS del dispositivo (API Nativa)
export async function getCurrentLocation(): Promise<LocationType | null> {
    try {
        // Solicitar permiso de ubicación
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return null;

        // Acceder al GPS del dispositivo
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        // Reverse geocoding: coordenadas → dirección legible
        const [reverseGeocode] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
    } catch (error) {
        return null;
    }
}
```

### 📝 Puntos clave a mencionar:

1. **APIs Nativas usadas**:
   - `expo-image-picker` → Acceso a cámara y galería
   - `expo-location` → Acceso a GPS y geolocalización
   - `expo-file-system` → Acceso al sistema de archivos

2. **Diferencia con Web**:
   - Web: Limitado al navegador
   - Nativo: Acceso directo al hardware

3. **Permisos**: El sistema operativo debe autorizar el acceso

### 🎯 Demostración práctica:
- Crear una nueva tarea
- Tomar foto con la cámara (muestra la cámara nativa)
- Capturar ubicación (muestra las coordenadas GPS)

---

## 3️⃣ ¿Qué es un servicio REST y cómo nos autenticamos a él?

### 📂 Archivos a mostrar:
- `services/apiService.ts` (líneas 153-178) - Login
- `services/apiService.ts` (líneas 70-96) - Manejo de Token
- `services/apiService.ts` (líneas 208-218) - Headers con Token

### 💬 Respuesta sugerida:

> "Un **servicio REST** es una API que permite la comunicación entre cliente y servidor usando el protocolo HTTP. Usamos métodos como **GET** (obtener), **POST** (crear), **PATCH** (actualizar) y **DELETE** (eliminar). Para **autenticarnos**, enviamos credenciales al servidor, recibimos un **token JWT**, y lo incluimos en cada solicitud posterior."

### 🖥️ Código de Login (`services/apiService.ts` líneas 153-178):

```typescript
// Función de LOGIN - Autenticación contra el backend
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
        // POST a /auth/login con email y password
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await handleResponse<AuthResponse>(response);

        // Guardar token en AsyncStorage para persistencia
        if (data.success && data.data.token) {
            await saveToken(data.data.token);  // ← Persistimos el token
        }

        return data;
    } catch (error) {
        throw new Error('Error de conexión');
    }
}
```

### 🖥️ Código de Manejo de Token (`services/apiService.ts` líneas 70-96):

```typescript
const TOKEN_KEY = '@todolist_token';

// Guardar token en AsyncStorage
export async function saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
}

// Obtener token de AsyncStorage
export async function getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
}

// Eliminar token (logout)
export async function removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
}
```

### 🖥️ Headers con Autenticación (`services/apiService.ts` líneas 208-218):

```typescript
// Crear headers con el token JWT para solicitudes autenticadas
async function getAuthHeaders(): Promise<HeadersInit> {
    const token = await getToken();
    if (!token) {
        throw new ApiError(401, 'No hay sesión activa');
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // ← Token en header
    };
}
```

### 📝 Puntos clave a mencionar:

1. **Flujo de autenticación**:
   ```
   Usuario → POST /auth/login → Servidor valida → Devuelve JWT Token
   Usuario → Guarda token en AsyncStorage
   Usuario → Todas las solicitudes incluyen: Authorization: Bearer <token>
   ```

2. **Métodos REST usados**:
   - `POST /auth/login` - Iniciar sesión
   - `POST /auth/register` - Registrar usuario
   - `GET /todos` - Listar tareas
   - `POST /todos` - Crear tarea
   - `PATCH /todos/:id` - Actualizar tarea
   - `DELETE /todos/:id` - Eliminar tarea
   - `POST /images` - Subir imagen

3. **¿Por qué JWT?**: Permite sesiones stateless, el servidor no necesita guardar sesiones

### 🎯 Demostración práctica:
- Mostrar el login en la app
- Mostrar en el código cómo se guarda el token
- Mostrar cómo se envía el token en cada request

---

## 4️⃣ ¿Cómo funcionan los hooks en React y cómo se crea un custom hook?

### 📂 Archivos a mostrar:
- `hooks/useTodos.ts` (completo) - Custom Hook
- `app/(tabs)/index.tsx` (líneas 22-38) - Uso del hook

### 💬 Respuesta sugerida:

> "Los **Hooks** son funciones especiales de React que permiten usar estado y otras características sin escribir clases. Un **Custom Hook** es una función que empieza con 'use' y encapsula lógica reutilizable. Nosotros creamos `useTodos` que maneja toda la lógica del CRUD de tareas."

### 🖥️ Custom Hook (`hooks/useTodos.ts` - estructura principal):

```typescript
// Custom Hook para manejar toda la lógica del Todo List
export function useTodos(): UseTodosReturn {
    // Estados del hook
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [filter, setFilter] = useState<Filter>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estadísticas calculadas
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    // Función para cargar tareas
    const loadTasks = useCallback(async () => {
        try {
            setError(null);
            const apiTasks = await getTasksFromApi();
            setTasks(apiTasks.map(apiTaskToTask));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Función para crear tarea
    const createTask = useCallback(async (taskData: CreateTaskPayload) => {
        await createTaskInApi(taskData);
        showNotification('✓ Tarea creada', 'success');
        await loadTasks();
    }, [loadTasks]);

    // Función para eliminar tarea
    const deleteTask = useCallback(async (taskId: string) => {
        await deleteTaskFromApi(taskId);
        showNotification('✓ Tarea eliminada', 'success');
        await loadTasks();
    }, [loadTasks]);

    // Retornar estados y funciones
    return {
        tasks, filteredTasks, filter, isLoading, error,
        totalTasks, completedTasks, pendingTasks,
        loadTasks, createTask, deleteTask, toggleCompletion, setFilter,
    };
}
```

### 🖥️ Uso del Hook (`app/(tabs)/index.tsx` líneas 22-38):

```typescript
export default function HomeTab() {
    const { email } = useUser();

    // ✨ Uso del Custom Hook useTodos - Encapsula toda la lógica
    const {
        filteredTasks,
        filter,
        setFilter,
        isLoading,
        isRefreshing,
        error,
        totalTasks,
        completedTasks,
        pendingTasks,
        createTask,
        updateTask,
        deleteTask,
        toggleCompletion,
        refreshTasks,
    } = useTodos();  // ← Una sola línea para obtener TODO

    // El componente solo maneja UI, no lógica de negocio
}
```

### 📝 Puntos clave a mencionar:

1. **Hooks nativos de React usados**:
   - `useState` - Manejar estado
   - `useEffect` - Efectos secundarios (cargar datos)
   - `useCallback` - Memorizar funciones
   - `useContext` - Acceder a contextos

2. **Reglas de los Hooks**:
   - Deben empezar con "use"
   - Solo se llaman en el nivel superior
   - Solo se llaman desde componentes de React u otros hooks

3. **Ventajas del Custom Hook**:
   - **Separación de responsabilidades**: Vista solo renderiza, hook maneja lógica
   - **Reutilizable**: Se podría usar en otros componentes
   - **Testeable**: Se puede probar independientemente
   - **Mantenible**: Cambios en lógica no afectan la UI

### 🎯 Demostración práctica:
- Mostrar el archivo `hooks/useTodos.ts`
- Mostrar cómo se importa y usa en `index.tsx`
- Mostrar cómo el componente quedó más limpio sin lógica de negocio

---

## 🎬 Consejos para el Video

1. **Duración**: 2-3 minutos por pregunta
2. **Mostrar código**: Tener los archivos abiertos antes de grabar
3. **Demostrar en la app**: Después de explicar, mostrar funcionando
4. **Hablar claro**: Explicar como si fuera a alguien que no sabe programar
5. **Mencionar archivos**: "Como pueden ver en el archivo X, línea Y..."

## 📁 Archivos Clave por Pregunta

| Pregunta | Archivo Principal | Líneas |
|----------|-------------------|--------|
| 1. Estados | `app/login.tsx` | 21-26 |
| 2. App Nativa | `components/TaskForm.tsx` | 102-124 |
| 3. REST + Auth | `services/apiService.ts` | 153-178, 208-218 |
| 4. Custom Hooks | `hooks/useTodos.ts` | Todo el archivo |

---

*Documento generado para la Evaluación Final - Diciembre 2025*
