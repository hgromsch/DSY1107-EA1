# Frontend React con AWS Cognito - Authorization Code Flow

Una aplicación React moderna que implementa autenticación con **AWS Cognito** usando el flujo **Authorization Code Flow** con validación de códigos de autorización.

## Características

✅ Validación automática de códigos de Cognito (`?code=...`)  
✅ Intercambio de código por tokens JWT  
✅ Authorization Code Flow seguro  
✅ Protección contra CSRF con parámetro `state`  
✅ Gestión de sesiones con Context API  
✅ Obtención de información del usuario  
✅ Almacenamiento seguro de tokens  
✅ Interfaz moderna y responsiva  

## Requisitos Previos

- Node.js 16+ instalado
- Una cuenta en [AWS](https://aws.amazon.com) con Cognito configurado
- npm o yarn

## Instalación

1. **Clona o descarga el proyecto:**
```bash
cd frontend
```

2. **Instala las dependencias:**
```bash
npm install
```

3. **Configura tu aplicación en Cognito:**

   a. En [AWS Console](https://console.aws.amazon.com/cognito), busca tu User Pool
   
   b. Ve a **App integration** > **App clients and analytics**
   
   c. Selecciona o crea un app client
   
   d. En **Hosted UI**, configura:
      - **Allowed callback URLs:** `http://localhost:5173/`
      - **Allowed sign-out URLs:** `http://localhost:5173`
      - **Allowed web origins:** `http://localhost:5173`

4. **Copia tus credenciales de Cognito:**
   
   En el `.env.local`:
   ```env
   VITE_AUTH0_DOMAIN=https://tu-dominio.auth.us-east-1.amazoncognito.com
   VITE_AUTH0_CLIENT_ID=tu-client-id
   VITE_AUTH0_CALLBACK_URL=http://localhost:5173/
   VITE_AUTH0_LOGOUT_URL=http://localhost:5173
   VITE_COGNITO_TOKEN_ENDPOINT=https://tu-dominio.auth.us-east-1.amazoncognito.com/oauth2/token
   VITE_COGNITO_JWKS_URI=https://cognito-idp.us-east-1.amazonaws.com/region_pool/.well-known/jwks.json
   ```

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── auth0Client.js              # Cliente Cognito con funciones de validación
│   ├── context/
│   │   └── Auth0Context.jsx        # Hook useAuth0() - maneja flujo completo
│   ├── components/
│   │   ├── Login.jsx               # Página de login
│   │   ├── Logout.jsx              # Widget de logout
│   │   └── ProtectedRoute.jsx      # HOC para rutas protegidas
│   ├── pages/
│   │   ├── Dashboard.jsx           # Página protegida
│   │   └── Callback.jsx            # Página de loading
│   └── App.jsx                     # Componente principal
├── .env.example                    # Template de variables
├── .env.local                      # Tus credenciales (secreto)
├── COGNITO_FLOW.md                 # Explicación del flujo
├── CODE_VALIDATION.md              # Cómo valida el código
└── README.md                       # Este archivo
```

## Uso

### Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Compilar para producción

```bash
npm run build
```

## Flujo de Autenticación

El flujo valida **automáticamente** códigos que vienen en la URL:

```
1. Usuario inicia sesión en Cognito
   ↓
2. Cognito redirige a: http://localhost:5173/?code=abc123&state=xyz
   ↓
3. La app detecta el código y estado
   ↓
4. Valida que el estado sea correcto (protección CSRF)
   ↓
5. Intercambia el código por tokens:
   POST /oauth2/token con grant_type=authorization_code
   ↓
6. Cognito devuelve: access_token, id_token
   ↓
7. La app decodifica el id_token para obtener datos del usuario
   ↓
8. Limpia la URL (remueve ?code=...&state=...)
   ↓
9. Muestra el Dashboard con los datos del usuario ✓
```

## Validación del Código

Cuando la URL incluye un código como:

```
http://localhost:5173/?code=9cf34c75-98c7-4ba5-8134-e951331b5190&state=abc123
```

La app automáticamente:

1. **Extrae** el código y estado de la URL
2. **Valida** que el estado coincida (CSRF protection)
3. **Intercambia** el código por tokens en Cognito
4. **Guarda** los tokens en localStorage
5. **Decodifica** el id_token para obtener datos del usuario
6. **Limpia** la URL
7. **Muestra** el Dashboard

Ver [CODE_VALIDATION.md](CODE_VALIDATION.md) para detalles técnicos.

## Usando la Autenticación en Componentes

```jsx
import { useAuth0 } from './context/Auth0Context';

function MiComponente() {
  const { isAuthenticated, user, login, logout, accessToken } = useAuth0();

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

## Llamadas a API Protegidas

```jsx
const { accessToken } = useAuth0();

const fetchData = async () => {
  const response = await fetch('https://tu-api.com/datos', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return response.json();
};
```

## Configuración para Producción

Antes de desplegar:

1. Cambia URLs a HTTPS
2. Actualiza **Allowed callback URLs** en Cognito
3. Configura variables de entorno de producción
4. Revisa la [documentación de AWS Cognito](https://docs.aws.amazon.com/cognito/)

## Funciones Disponibles (auth0Client.js)

### Validación de Código

- `getAuthorizationCode()` - Extrae el código de la URL
- `getStateFromUrl()` - Obtiene el estado de la URL
- `exchangeCodeForToken(code)` - Intercambia código por tokens

### Gestión de Tokens

- `saveToken(token)` - Guarda el access token
- `getToken()` - Obtiene el access token
- `clearToken()` - Borra el access token
- `isTokenExpired(token)` - Verifica si expiró

### Información del Usuario

- `getUserFromToken()` - Decodifica id_token
- `decodeToken(token)` - Decodifica cualquier JWT

### Login/Logout

- `getLoginUrl()` - URL para iniciar sesión
- `getLogoutUrl()` - URL para cerrar sesión

## Troubleshooting

**Error: "State mismatch"**
- El código viene de otra sesión
- Limpia localStorage e intenta de nuevo

**Error: "Token exchange failed"**
- Verifica que el endpoint token sea correcto
- Comprueba las variables de entorno

**Error: "Invalid Client ID"**
- Asegúrate que copié el Client ID correctamente
- Reinicia el servidor de desarrollo

**No se guarda la sesión**
- El SDK guarda tokens en localStorage automáticamente
- Si no funciona, verifica en DevTools → Application → Local Storage

## Recursos

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [OAuth 2.0 Authorization Code Flow](https://datatracker.ietf.org/doc/html/rfc6749#section-1.3.1)
- [OIDC Connect](https://openid.net/specs/openid-connect-core-1_0.html)
- [React Hooks Documentation](https://react.dev/reference/react/useContext)
- [COGNITO_FLOW.md](COGNITO_FLOW.md) - Guía completa del flujo
- [CODE_VALIDATION.md](CODE_VALIDATION.md) - Detalles de validación del código

## Licencia

MIT
