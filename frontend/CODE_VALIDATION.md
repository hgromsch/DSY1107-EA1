# Validación del Código: Cómo Funciona en la Práctica

## La URL que recibes

Cuando el usuario inicia sesión en Cognito, es redirigido a:

```
http://localhost:5173/?code=9cf34c75-98c7-4ba5-8134-e951331b5190&state=abc123def456
```

## Desglose de la URL

| Componente | Valor | Descripción |
|-----------|-------|-------------|
| `http://localhost:5173/` | Callback URL | URL a donde se redirige |
| `?` | Separator | Inicia los parámetros de query |
| `code=9cf34c75...` | Authorization Code | Código para obtener tokens |
| `&` | Separator | Separa parámetros |
| `state=abc123...` | State | Token CSRF para validar la sesión |

## Cómo la App Procesa el Código

### Paso 1: Detectar el Código

En `Auth0Context.jsx`, el `useEffect` hace:

```javascript
// Extrae el código de la URL
const code = getAuthorizationCode();
// Resultado: "9cf34c75-98c7-4ba5-8134-e951331b5190"

// Extrae el estado
const stateFromUrl = getStateFromUrl();
// Resultado: "abc123def456"
```

### Paso 2: Validar el Estado

Protección contra CSRF:

```javascript
const savedState = getSavedState();
// savedState es lo que guardamos antes de redirigir a Cognito

if (stateFromUrl !== savedState) {
  throw new Error('State mismatch - possible CSRF attack');
}
// ✓ Los estados coinciden, es seguro continuar
```

### Paso 3: Intercambiar Código por Tokens

Llama a Cognito:

```javascript
const tokens = await exchangeCodeForToken(code);

// Internamente hace:
// POST https://dsy1107-grupo01.auth.us-east-1.amazoncognito.com/oauth2/token
// Con cuerpo:
// {
//   "grant_type": "authorization_code",
//   "client_id": "6rm6kp1ln3hgdorqv7ngkejtcl",
//   "code": "9cf34c75-98c7-4ba5-8134-e951331b5190",
//   "redirect_uri": "http://localhost:5173/"
// }
```

### Paso 4: Cognito Responde

Si el código es válido:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im5tdWVLVkM4d2RtTll0emZ2cTNoQjFkZHBrMkN0aWdFMzNzeFFZMk9QZzA9In0.eyJzdWIiOiJ1cy1lYXN0LTFfOEpXOVVubkNVOmQyYmZkMjIyLWY4MjItNDhlNS04ZTk4LTUxYjg3N2FiNjhjNyIsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xXzhKVzlVbm5DVSIsImNsaWVudF9pZCI6IjZybTZrcDFsbjNoZ2RvcnF2N25na2VqdGNsIiwib3JpZ2luX2p0aSI6IjJlZjVmOTMzLWI5Y2ItNDcxZi1iYmQyLWU1MDY1ZGU2OWY3MCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJhdXRoX3RpbWUiOjE2OTIwMTQ0MDAsImV4cCI6MTY5MjAxODAwMCwiaWF0IjoxNjkyMDE0NDAwLCJ2ZXJzaW9uIjoyLCJqdGkiOiI0N2ZjYjJkMC1hNjJhLTQ5N2EtOTVlOC0yN2M2MzJhMWUxZjQiLCJ1c2VybmFtZSI6ImQyYmZkMjIyLWY4MjItNDhlNS04ZTk4LTUxYjg3N2FiNjhjNyJ9.abc123...",
  
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im5tdWVLVkM4d2RtTll0emZ2cTNoQjFkZHBrMkN0aWdFMzNzeFFZMk9QZzA9In0.eyJzdWIiOiJ1cy1lYXN0LTFfOEpXOVVubkNVOmQyYmZkMjIyLWY4MjItNDhlNS04ZTk4LTUxYjg3N2FiNjhjNyIsImlzc3VlciI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xXzhKVzlVbm5DVSIsImNvZ25pdG86dXNlcm5hbWUiOiJkMmJmZDIyMi1mODIyLTQ4ZTUtOGU5OC01MWI4Nzdhbjc2YzciLCJhdWQiOiI2cm02a3AxbG4zaGdkb3JxdjduZ2tlanRjbCIsImV2ZW50X2lkIjoiMmVmNWY5MzMtYjljYi00NzFmLWJiZDItZTUwNjVkZTY5ZjcwIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2OTIwMTQ0MDAsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xXzhKVzlVbm5DVSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJjb2duaXRvOmF1dGhvcml0aWVzIjpudWxsLCJuYW1lIjoiSnVhbiBQw6lyZXoiLCJlbWFpbCI6Imp1YW5AZXhhbXBsZS5jb20iLCJleHAiOjE2OTIwMTgwMDAsImlhdCI6MTY5MjAxNDQwMH0.xyz789...",
  
  "token_type": "Bearer",
  
  "expires_in": 3600
}
```

### Paso 5: Guardar Tokens

```javascript
// Guardar en localStorage
saveToken(tokens.access_token);
saveIdToken(tokens.id_token);

// También se guarda en el state de React
setAccessToken(tokens.access_token);
```

### Paso 6: Extraer Información del Usuario

El `id_token` es un JWT. Se decodifica extrayendo el payload (segunda parte):

```javascript
// id_token.split('.')[1] es el payload codificado en Base64
// Decodificado, contiene:

{
  "sub": "us-east-1_8JW9UnnCU:d2bfd222-f822-48e5-8e98-51b877ab68c7",
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "email_verified": true,
  "cognito:username": "d2bfd222-f822-48e5-8e98-51b877ab68c7",
  "aud": "6rm6kp1ln3hgdorqv7ngkejtcl",
  "iat": 1692014400,
  "exp": 1692018000,
  "token_use": "id"
}

// Esta info se obtiene con:
const user = getUserFromToken();
// user = { name: "Juan Pérez", email: "juan@example.com", ... }
```

### Paso 7: Limpiar URL

```javascript
// Remover código y estado de la URL para que no sea visible
window.history.replaceState({}, document.title, window.location.pathname);

// Cambiar de: http://localhost:5173/?code=...&state=...
// A:          http://localhost:5173/
```

### Paso 8: Mostrar Dashboard

```javascript
// Estado actualizado en React
setUser(userData);           // Información del usuario
setIsAuthenticated(true);    // Usuario autenticado
setLoading(false);           // Terminó de cargar

// El componente App detecta esto y muestra el Dashboard
```

## Visualización del Flujo Completo

```
URL original:
http://localhost:5173/?code=9cf34c75-98c7-4ba5-8134-e951331b5190&state=abc123def456
                      ↓
getAuthorizationCode() = "9cf34c75-98c7-4ba5-8134-e951331b5190"
getStateFromUrl() = "abc123def456"
                      ↓
Validar estado (CSRF protection)
Comparar con getSavedState() → "abc123def456" ✓ Coinciden
                      ↓
exchangeCodeForToken("9cf34c75-98c7-4ba5-8134-e951331b5190")
                      ↓
POST https://dsy1107-grupo01.auth.us-east-1.amazoncognito.com/oauth2/token
Body: grant_type=authorization_code&client_id=...&code=...&redirect_uri=...
                      ↓
Respuesta de Cognito:
{
  "access_token": "eyJ...",
  "id_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 3600
}
                      ↓
saveToken(access_token)
saveIdToken(id_token)
                      ↓
Decodificar id_token:
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "email_verified": true,
  ...
}
                      ↓
setUser(userData)
setIsAuthenticated(true)
                      ↓
Limpiar URL:
http://localhost:5173/ (sin código)
                      ↓
Mostrar Dashboard con datos del usuario ✓
```

## Qué Sucede en Caso de Error

### Error 1: Código Inválido

Si el código es incorrecto o expiró:

```
POST /oauth2/token
Respuesta: 400 Bad Request
{
  "error": "invalid_grant",
  "error_description": "Authorization code has expired"
}
```

La app:
- Lanza error: "Token exchange failed: Bad Request"
- Muestra mensaje de error en la UI
- Usuario puede reintentar con el botón "Reintentar"

### Error 2: State Mismatch

Si alguien intenta usar un código de otra sesión:

```
URL: http://localhost:5173/?code=...&state=xyz_falso
savedState = "abc123def456"
stateFromUrl = "xyz_falso"
```

La app:
- Lanza error: "State mismatch - possible CSRF attack"
- No intercambia el código
- Redirige a login

### Error 3: Token Expirado

Si el usuario intenta usar un token antiguo:

```javascript
const token = localStorage.getItem('id_token');
isTokenExpired(token) // true

// La app automáticamente:
clearToken();
clearIdToken();
setIsAuthenticated(false);
// Redirige a login
```

## Monitoreo en DevTools

### Pestaña Network

Verás las peticiones:

1. **GET /** - Página inicial (con `?code=...&state=...`)
2. **POST /oauth2/token** - Intercambio de código (a Cognito)
3. **GET /** - Recarga después de limpiar URL

### Pestaña Console

```javascript
// Ver los códigos en la consola:
console.log(localStorage.getItem('access_token'));
console.log(localStorage.getItem('id_token'));

// Decodificar el id_token:
const token = localStorage.getItem('id_token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log(payload);
// Output:
// {
//   name: "Juan Pérez",
//   email: "juan@example.com",
//   ...
// }
```

### Pestaña Application (Storage)

- **localStorage:**
  - `access_token` - Token para APIs
  - `id_token` - Token con info del usuario
  - `auth_state` - Estado para CSRF (limpiado después)

## Seguridad

El flujo incluye varias capas de seguridad:

1. **Code Verifier/Challenge (PKCE)** - Previene interceptación de código
   - No se implementa aquí porque Cognito lo maneja internamente
   
2. **State Parameter (CSRF Protection)** - Valida que el callback es legítimo
   - Se genera antes de redirigir a Cognito
   - Se compara en el callback
   - Si no coincide, se rechaza

3. **HTTPS en Producción** - Encripta toda la comunicación
   - En desarrollo uses HTTP pero en prod debe ser HTTPS

4. **Token Signing** - Cognito firma los tokens con sus claves privadas
   - En producción, verifica la firma con las claves públicas (JWKS)

5. **Token Expiration** - Los tokens expiran después de un tiempo
   - Se puede verificar con `isTokenExpired()`
   - El app redirige a login si expiró

## Resumen

El código que recibes en `?code=9cf34c75-98c7-4ba5-8134-e951331b5190` es:

1. ✅ Detectado automáticamente
2. ✅ Validado contra CSRF
3. ✅ Intercambiado por tokens reales
4. ✅ Almacenado de forma segura
5. ✅ Usado para obtener información del usuario
6. ✅ Reiniciado al recargar la página

Todo sucede automáticamente cuando cargas `http://localhost:5173/` ¡sin que hagas nada!
