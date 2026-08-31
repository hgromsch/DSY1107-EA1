# Validación de Código de Cognito

Esta aplicación valida automáticamente códigos de autorización de AWS Cognito.

## Flujo de Autenticación

```
1. Usuario hace clic en "Iniciar Sesión"
   ↓
2. Se redirige a Cognito: https://tu-dominio.auth.region.amazoncognito.com/login
   ↓
3. Usuario inicia sesión en Cognito
   ↓
4. Cognito redirige a: http://localhost:5173/?code=abc123&state=xyz
   ↓
5. La app valida el `state` (protección CSRF)
   ↓
6. La app intercambia el código por un token:
   POST https://tu-dominio.auth.region.amazoncognito.com/oauth2/token
   {
     "grant_type": "authorization_code",
     "client_id": "tu-client-id",
     "code": "abc123",
     "redirect_uri": "http://localhost:5173/"
   }
   ↓
7. Cognito devuelve: {access_token, id_token, token_type}
   ↓
8. Los tokens se guardan en localStorage
   ↓
9. La app decodifica el id_token para obtener datos del usuario
   ↓
10. ✅ Usuario autenticado - se muestra Dashboard
```

## Variables de Entorno Necesarias

En `.env.local`:

```env
# URL base de tu Cognito
VITE_AUTH0_DOMAIN=https://dsy1107-grupo01.auth.us-east-1.amazoncognito.com

# Client ID de tu app en Cognito
VITE_AUTH0_CLIENT_ID=6rm6kp1ln3hgdorqv7ngkejtcl

# URL de callback (donde Cognito te redirige)
VITE_AUTH0_CALLBACK_URL=http://localhost:5173/

# URL de logout
VITE_AUTH0_LOGOUT_URL=http://localhost:5173

# Endpoint para intercambiar código por tokens
VITE_COGNITO_TOKEN_ENDPOINT=https://dsy1107-grupo01.auth.us-east-1.amazoncognito.com/oauth2/token

# JWKS para verificar tokens (opcional en desarrollo)
VITE_COGNITO_JWKS_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_8JW9UnnCU/.well-known/jwks.json
```

## Cómo Funciona

### 1. Detectar el Código en la URL

Cuando Cognito redirige a tu app después del login, envía un `code`:

```
http://localhost:5173/?code=9cf34c75-98c7-4ba5-8134-e951331b5190&state=abc123
```

La app automáticamente:
1. Extrae el código con `getAuthorizationCode()`
2. Valida el estado con `getStateFromUrl()` y `getSavedState()`
3. Si todo es válido, intercambia el código por tokens

### 2. Intercambiar Código por Tokens

La función `exchangeCodeForToken(code)` hace:

```javascript
POST /oauth2/token HTTP/1.1
Host: dsy1107-grupo01.auth.us-east-1.amazoncognito.com
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
client_id=6rm6kp1ln3hgdorqv7ngkejtcl&
code=9cf34c75-98c7-4ba5-8134-e951331b5190&
redirect_uri=http://localhost:5173/
```

Cognito responde con:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### 3. Guardar Tokens

Los tokens se guardan en localStorage:

```javascript
saveToken(tokens.access_token);        // Access token
saveIdToken(tokens.id_token);          // ID token con info del usuario
```

### 4. Obtener Información del Usuario

El `id_token` es un JWT que contiene información del usuario. Se decodifica con:

```javascript
const user = getUserFromToken();
// Devuelve:
// {
//   sub: "us-east-1_xxx:usuario-id",
//   email_verified: true,
//   name: "Juan Pérez",
//   email: "juan@example.com",
//   cognito:username: "juan@example.com",
//   aud: "6rm6kp1ln3hgdorqv7ngkejtcl",
//   event_id: "...",
//   token_use: "id",
//   iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxx",
//   iat: 1692014400,
//   exp: 1692018000
// }
```

## Funciones Disponibles

### Autenticación

- `getLoginUrl()` - Genera la URL de login
- `getLogoutUrl()` - Genera la URL de logout
- `getAuthorizationCode()` - Extrae el código de la URL
- `getStateFromUrl()` - Extrae el estado de la URL

### Tokens

- `exchangeCodeForToken(code)` - Intercambia código por tokens
- `saveToken(token)` - Guarda el access token
- `getToken()` - Obtiene el access token
- `clearToken()` - Borra el access token
- `saveIdToken(token)` - Guarda el ID token
- `getIdToken()` - Obtiene el ID token
- `clearIdToken()` - Borra el ID token
- `isTokenExpired(token)` - Verifica si el token expiró

### Usuario

- `getUserFromToken()` - Obtiene la información del usuario
- `decodeToken(token)` - Decodifica un JWT (sin validar firma)

### Estado (CSRF Protection)

- `saveState(state)` - Guarda el estado
- `getSavedState()` - Obtiene el estado guardado
- `clearState()` - Borra el estado

## Protección CSRF

El flujo incluye protección contra ataques CSRF usando el parámetro `state`:

1. Antes de redirigir a Cognito, se genera un `state` aleatorio y se guarda
2. Cognito devuelve el mismo `state` en el callback
3. La app verifica que el `state` coincida
4. Si no coincide, lanza error "State mismatch - possible CSRF attack"

## Hook useAuth0()

Puedes usar el hook en tus componentes:

```jsx
import { useAuth0 } from './context/Auth0Context';

function MiComponente() {
  const {
    isAuthenticated,  // boolean
    user,             // objeto con datos del usuario
    loading,          // boolean - cargando
    error,            // Error si ocurrió algo
    login,            // función para login
    logout,           // función para logout
    getAccessToken,   // obtener access token
    accessToken,      // access token actual
  } = useAuth0();

  if (loading) return <p>Cargando...</p>;
  if (!isAuthenticated) return <button onClick={login}>Login</button>;

  return <h1>Bienvenido, {user.name}!</h1>;
}
```

## Llamadas a API Protegidas

Para llamar a tu API backend usando el access token:

```jsx
const { accessToken } = useAuth0();

const fetchData = async () => {
  const response = await fetch('https://tu-api.com/datos', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  return data;
};
```

## Depuración

### Ver el token en la consola

```javascript
// En la consola del navegador
localStorage.getItem('access_token')
localStorage.getItem('id_token')

// Decodificar manualmente
const token = localStorage.getItem('id_token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log(payload);
```

### Ver el flujo en Network

1. Abre DevTools (F12)
2. Ve a la pestaña Network
3. Haz clic en "Iniciar Sesión"
4. Verás las peticiones:
   - GET a `/login` (Cognito)
   - GET de vuelta a `/` con `?code=...&state=...`
   - POST a `/oauth2/token` (intercambio de código)

## Manejo de Errores

La app maneja automáticamente:

- ✅ Código inválido o expirado
- ✅ State mismatch (CSRF)
- ✅ Token expirado
- ✅ Problemas de red

Los errores se muestran en la UI y en la consola del navegador.

## Configuración en Cognito

Para que todo funcione, en AWS Cognito debes tener:

1. **App Client Settings:**
   - Enabled identity providers: tus providers (Cognito, Google, etc.)
   - Callback URL(s): `http://localhost:5173/` (y `https://tu-dominio.com/` en prod)
   - Sign out URL(s): `http://localhost:5173` (y `https://tu-dominio.com` en prod)
   - Allowed OAuth Scopes: `openid`, `email`, `profile`
   - Allowed OAuth Flows: Authorization code grant

2. **Domain:**
   - Debe estar disponible y en tu región

## Producción

Para desplegar a producción:

1. Cambia las variables de entorno a URLs de producción
2. Actualiza Callback URL y Sign out URL en Cognito
3. Usa HTTPS en lugar de HTTP
4. Considera verificar la firma de los tokens con JWKS (ver `verifyTokenSignature()` en el código)

## Recursos

- [AWS Cognito Docs](https://docs.aws.amazon.com/cognito/)
- [OAuth 2.0 Authorization Code Flow](https://datatracker.ietf.org/doc/html/rfc6749#section-1.3.1)
- [OIDC](https://openid.net/specs/openid-connect-core-1_0.html)
