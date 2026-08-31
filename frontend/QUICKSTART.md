# 🚀 INICIO RÁPIDO - React + AWS Cognito

## La Mágica del Código en la URL

Cuando recibes una URL como:
```
http://localhost:5173/?code=9cf34c75-98c7-4ba5-8134-e951331b5190
```

**La app automáticamente:**
1. ✅ Detecta el código
2. ✅ Lo valida
3. ✅ Lo intercambia por un token
4. ✅ Obtiene datos del usuario
5. ✅ Limpia la URL
6. ✅ Muestra el Dashboard

**¡Sin que hagas nada!**

## Configuración Rápida (5 minutos)

### Paso 1: Copiar Credenciales de Cognito

En `.env.local`:

```env
VITE_AUTH0_DOMAIN=https://tu-dominio.auth.us-east-1.amazoncognito.com
VITE_AUTH0_CLIENT_ID=tu-client-id
VITE_AUTH0_CALLBACK_URL=http://localhost:5173/
VITE_AUTH0_LOGOUT_URL=http://localhost:5173
VITE_COGNITO_TOKEN_ENDPOINT=https://tu-dominio.auth.us-east-1.amazoncognito.com/oauth2/token
VITE_COGNITO_JWKS_URI=https://cognito-idp.us-east-1.amazonaws.com/region/.well-known/jwks.json
```

### Paso 2: Iniciar

```bash
cd frontend
npm run dev
```

Abre http://localhost:5173

### Paso 3: Probar

1. Haz clic en "Iniciar Sesión"
2. Serás redirigido a Cognito
3. Inicia sesión (o crea una cuenta)
4. Serás redirigido a `http://localhost:5173/?code=...&state=...`
5. **La app automáticamente procesa el código** ✓
6. Ves tu Dashboard con tus datos

## Cómo Funciona el Flujo

```
http://localhost:5173/?code=abc123&state=xyz
                        ↓
                getAuthorizationCode() → "abc123"
                getStateFromUrl() → "xyz"
                        ↓
                Validar state (CSRF protection)
                        ↓
        exchangeCodeForToken("abc123")
                        ↓
        POST /oauth2/token a Cognito
                        ↓
        Respuesta: {access_token, id_token, ...}
                        ↓
        saveToken(access_token)
        saveIdToken(id_token)
                        ↓
        getUserFromToken() → extraer datos del usuario
                        ↓
        window.history.replaceState() → limpiar URL
                        ↓
        Mostrar Dashboard ✓
```

## Estructura del Código

```
frontend/
├── src/
│   ├── auth0Client.js                ← Funciones para validar código
│   │   ├── getAuthorizationCode()
│   │   ├── exchangeCodeForToken()
│   │   ├── saveToken() / getToken()
│   │   └── getUserFromToken()
│   │
│   ├── context/Auth0Context.jsx      ← Hook useAuth0()
│   │   └── Usa las funciones de auth0Client.js
│   │   └── Maneja el flujo automáticamente
│   │
│   └── App.jsx                       ← Componente principal
│       └── Verifica: ¿Está autenticado?
│           ├── No → Muestra Login
│           └── Sí → Muestra Dashboard
│
├── .env.local                        ← TUS CREDENCIALES
└── ... otros archivos
```

## Funciones Principales

### 1. Detectar y Procesar Código

```javascript
// En auth0Client.js:

// Extrae el código de la URL
getAuthorizationCode()
// Entrada: http://localhost:5173/?code=abc123&state=xyz
// Salida: "abc123"

// Extrae el estado
getStateFromUrl()
// Salida: "xyz"
```

### 2. Intercambiar Código por Tokens

```javascript
// En auth0Client.js:

exchangeCodeForToken("abc123")
// Envía a Cognito:
// POST /oauth2/token
// Body: grant_type=authorization_code&client_id=...&code=abc123&...
//
// Respuesta de Cognito:
// {
//   "access_token": "eyJ...",
//   "id_token": "eyJ...",
//   "token_type": "Bearer",
//   "expires_in": 3600
// }
```

### 3. Guardar Tokens

```javascript
// En auth0Client.js:

saveToken(tokens.access_token)        // Guarda en localStorage
saveIdToken(tokens.id_token)          // Guarda en localStorage

// Ahora están disponibles:
getToken()                            // Obtiene access_token
getIdToken()                          // Obtiene id_token
```

### 4. Obtener Datos del Usuario

```javascript
// En auth0Client.js:

getUserFromToken()
// Decodifica el id_token y extrae:
// {
//   "name": "Juan Pérez",
//   "email": "juan@example.com",
//   "email_verified": true,
//   "sub": "us-east-1_xxx:user-id",
//   ...
// }
```

## Usar en Tus Componentes

```jsx
import { useAuth0 } from './context/Auth0Context';

function MiComponente() {
  const {
    isAuthenticated,  // ¿Está autenticado?
    user,             // Datos del usuario
    loading,          // ¿Está cargando?
    error,            // ¿Hay error?
    login,            // Función para login
    logout,           // Función para logout
    accessToken,      // Token para APIs
  } = useAuth0();

  if (loading) return <p>Cargando...</p>;
  
  if (!isAuthenticated) {
    return <button onClick={login}>Iniciar Sesión</button>;
  }

  return (
    <div>
      <h1>Hola, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

## Llamadas a APIs Protegidas

```jsx
const { accessToken } = useAuth0();

async function fetchDatos() {
  const response = await fetch('https://tu-api.com/datos', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  return response.json();
}
```

## Depuración

### Ver el código en la consola

```javascript
// En la consola del navegador (F12):

// Ver la URL actual
console.log(window.location.search);
// Output: "?code=abc123&state=xyz"

// Extraer el código manualmente
const params = new URLSearchParams(window.location.search);
console.log(params.get('code'));
// Output: "abc123"
```

### Ver los tokens guardados

```javascript
// En la consola del navegador:

// Ver los tokens
console.log(localStorage.getItem('access_token'));
console.log(localStorage.getItem('id_token'));

// Decodificar el id_token manualmente
const token = localStorage.getItem('id_token');
const payload = token.split('.')[1];
const decoded = JSON.parse(atob(payload));
console.log(decoded);
// Output:
// {
//   name: "Juan Pérez",
//   email: "juan@example.com",
//   ...
// }
```

### Ver las peticiones en Network

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Haz clic en "Iniciar Sesión"
4. Verás:
   - GET a Cognito (login page)
   - GET de vuelta a `/` con `?code=...`
   - **POST a `/oauth2/token`** (intercambio de código) ← Aquí ocurre la magia

## Seguridad

El flujo incluye protecciones:

1. **State Parameter** - Previene CSRF
   - Se genera antes de redirigir a Cognito
   - Se valida en el callback
   - Si no coincide → Error

2. **HTTPS en Producción** - Encripta la comunicación
   - En desarrollo está bien usar HTTP
   - En producción DEBE ser HTTPS

3. **Token Signing** - Cognito firma los tokens
   - Solo Cognito puede crear tokens válidos
   - La app verifica la firma (en producción)

4. **Token Expiration** - Los tokens expiran
   - No duran para siempre
   - Se puede verificar con `isTokenExpired()`

## Errores Comunes

| Error | Solución |
|-------|----------|
| "State mismatch" | Limpia localStorage, intenta de nuevo |
| "Token exchange failed" | Verifica variables de entorno |
| "Invalid Client ID" | Copia correctamente de Cognito |
| Página en blanco | Abre Console (F12) para ver errores |
| No se carga usuario | Recarga la página |

## Documentación Completa

- **README.md** - Documentación general
- **COGNITO_FLOW.md** - Explicación detallada del flujo
- **CODE_VALIDATION.md** - Cómo valida el código
- **EXAMPLES.md** - Ejemplos de código

## Resumen

```
Tu URL con código:
http://localhost:5173/?code=9cf34c75-98c7-4ba5-8134-e951331b5190

              ↓ (automático)

✅ App detecta el código
✅ App valida el estado
✅ App intercambia código por tokens
✅ App extrae datos del usuario
✅ App limpia la URL
✅ Ves Dashboard

¡Sin escribir código adicional!
```

---

**¿Listo?** Ejecuta `npm run dev` y abre http://localhost:5173 🎉

