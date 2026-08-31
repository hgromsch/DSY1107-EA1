# Guía de Configuración de AWS Cognito

Esta guía te ayudará a configurar AWS Cognito para tu aplicación React.

## Paso 1: Acceder a AWS Cognito

1. Ve a https://console.aws.amazon.com/cognito
2. Inicia sesión con tu cuenta AWS
3. Selecciona una región (ej: us-east-1)

## Paso 2: Crear o Usar un User Pool

### Si YA tienes un User Pool:
1. Haz clic en **User Pools**
2. Selecciona tu pool (ej: "us-east-1_8JW9UnnCU")
3. Ve al Paso 3

### Si necesitas crear uno nuevo:
1. Haz clic en **Create user pool**
2. Configura las opciones según necesites
3. Haz clic en **Create pool**
4. Copia el **Pool ID** (ej: us-east-1_8JW9UnnCU)

## Paso 3: Configurar App Client

1. En tu User Pool, ve a **App integration** → **App clients and analytics**
2. Haz clic en **Create app client** o selecciona uno existente

### Configuración General:
- **App client name**: Mi App React
- **Refresh token expiration**: 30 (días)
- **Access token expiration**: 60 (minutos)
- **ID token expiration**: 60 (minutos)

### Authentication flows:
- ✅ ALLOW_USER_PASSWORD_AUTH
- ✅ ALLOW_REFRESH_TOKEN_AUTH
- ✅ ALLOW_CUSTOM_AUTH
- ✅ ALLOW_USER_SRP_AUTH

## Paso 4: Configurar URLs de Callback

1. En tu App Client, ve a **Hosted UI settings**

2. Configura:
   - **Allowed redirect URIs (callback URLs):**
     ```
     http://localhost:5173/
     https://tu-dominio.com/  (producción)
     ```

   - **Allowed sign-out redirect URIs (logout URLs):**
     ```
     http://localhost:5173
     https://tu-dominio.com  (producción)
     ```

   - **Allowed web origins:**
     ```
     http://localhost:5173
     https://tu-dominio.com  (producción)
     ```

3. **OAuth Scopes:** Selecciona:
   - ✅ openid
   - ✅ email
   - ✅ profile

4. **Allowed OAuth Flows:**
   - ✅ Authorization code grant

5. Haz clic en **Save**

## Paso 5: Obtener Credenciales

1. En el App Client, ve a **General settings**

2. Copia estos valores:

   | Variable | Valor | Ejemplo |
   |----------|-------|---------|
   | VITE_AUTH0_CLIENT_ID | **Client ID** | 6rm6kp1ln3hgdorqv7ngkejtcl |
   | VITE_AUTH0_DOMAIN | **Cognito Domain** + auth + región | https://dsy1107-grupo01.auth.us-east-1.amazoncognito.com |

3. En tu User Pool, ve a **App integration** → **Domain name**

4. Copia el **Cognito Domain** (ej: dsy1107-grupo01)

## Paso 6: Configurar las Variables de Entorno

1. En la carpeta `frontend`, crea o edita `.env.local`

2. Reemplaza con tus valores reales:

```env
# Cognito Configuration
VITE_AUTH0_DOMAIN=https://tu-dominio.auth.us-east-1.amazoncognito.com
VITE_AUTH0_CLIENT_ID=tu-client-id
VITE_AUTH0_CALLBACK_URL=http://localhost:5173/
VITE_AUTH0_LOGOUT_URL=http://localhost:5173
VITE_COGNITO_TOKEN_ENDPOINT=https://tu-dominio.auth.us-east-1.amazoncognito.com/oauth2/token
VITE_COGNITO_JWKS_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxx/.well-known/jwks.json
```

### Valores a reemplazar:

| Variable | De dónde copiar |
|----------|-----------------|
| `tu-dominio` | App Client → General settings → Cognito domain |
| `us-east-1` | Tu región en AWS |
| `tu-client-id` | App Client → General settings → Client ID |
| `us-east-1_xxx` | User Pool → General settings → Pool ID |

## Paso 7: Iniciar la Aplicación

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Paso 8: Probar la Autenticación

1. Abre http://localhost:5173 en tu navegador
2. Haz clic en **Iniciar Sesión**
3. Serás redirigido a Cognito
4. **Opción A:** Crea una nueva cuenta
   - Email
   - Contraseña (al menos 8 caracteres)
   - Completa la verificación del email
5. **Opción B:** Usa una cuenta existente si ya tienes
6. Autoriza el acceso
7. Serás redirigido a `http://localhost:5173/?code=...`
8. **La app procesa automáticamente el código** ✓
9. Ves tu Dashboard con tus datos

## Verificar que Funciona

### En el navegador:

1. Abre DevTools (F12)
2. Ve a **Application** → **Local Storage**
3. Deberías ver:
   - `access_token` - Token para APIs
   - `id_token` - Token con info del usuario

4. Abre la **Console** y pega:
   ```javascript
   const token = localStorage.getItem('id_token');
   const payload = token.split('.')[1];
   const decoded = JSON.parse(atob(payload));
   console.log(decoded);
   ```

5. Deberías ver tus datos:
   ```javascript
   {
     name: "Tu Nombre",
     email: "tu@email.com",
     email_verified: true,
     ...
   }
   ```

## Configuración para Producción

Cuando despliegues a producción:

### 1. Crear nuevo App Client para Producción

En AWS Cognito:
1. Crea un nuevo App Client o usa uno existente
2. Actualiza las URLs a HTTPS

### 2. Actualizar Cognito

En tu App Client:
- **Allowed redirect URIs (callback URLs):**
  ```
  https://tu-dominio-produccion.com/
  ```

- **Allowed sign-out redirect URIs:**
  ```
  https://tu-dominio-produccion.com
  ```

- **Allowed web origins:**
  ```
  https://tu-dominio-produccion.com
  ```

### 3. Configurar Variables de Producción

En tu plataforma de hosting (Vercel, Netlify, etc.):

```env
VITE_AUTH0_DOMAIN=https://tu-dominio.auth.us-east-1.amazoncognito.com
VITE_AUTH0_CLIENT_ID=tu-client-id-produccion
VITE_AUTH0_CALLBACK_URL=https://tu-dominio-produccion.com/
VITE_AUTH0_LOGOUT_URL=https://tu-dominio-produccion.com
VITE_COGNITO_TOKEN_ENDPOINT=https://tu-dominio.auth.us-east-1.amazoncognito.com/oauth2/token
VITE_COGNITO_JWKS_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxx/.well-known/jwks.json
```

### 4. Usar HTTPS Obligatoriamente

- SIEMPRE usa HTTPS en producción
- El protocolo OAuth requiere HTTPS para seguridad
- HTTP solo es permitido en localhost (desarrollo)

## Entender el Flujo de Código

Cuando el usuario inicia sesión:

1. Eres redirigido a Cognito
2. Usuario inicia sesión
3. Cognito te redirige a: `http://localhost:5173/?code=abc123&state=xyz`
4. **La app automáticamente:**
   - Extrae el código con `getAuthorizationCode()`
   - Valida el estado (CSRF protection)
   - Intercambia el código por tokens
   - Guarda los tokens en localStorage
   - Decodifica el id_token para obtener datos del usuario
   - Limpia la URL
   - Muestra el Dashboard

Ver [CODE_VALIDATION.md](CODE_VALIDATION.md) para más detalles.

## Troubleshooting

### Error: "Unauthorized"

**Causa:** Las URLs de callback no están configuradas correctamente

**Solución:**
1. Ve a AWS Cognito → App Client → Hosted UI settings
2. Verifica que `http://localhost:5173/` esté en **Allowed redirect URIs**
3. Verifica que `http://localhost:5173` esté en **Allowed sign-out redirect URIs**

### Error: "Invalid Client ID"

**Causa:** El Client ID no es correcto

**Solución:**
1. Abre `.env.local`
2. Copia el Client ID correctamente desde AWS Cognito
3. Asegúrate de copiar exactamente sin espacios

### Error: "State mismatch"

**Causa:** El código viene de otra sesión

**Solución:**
1. Limpia el localStorage: 
   ```javascript
   localStorage.clear();
   ```
2. Recarga la página
3. Intenta de nuevo

### No aparece el usuario en el Dashboard

**Causa:** El id_token no se decodificó correctamente

**Solución:**
1. Abre DevTools (F12)
2. Ve a Console
3. Pega:
   ```javascript
   const token = localStorage.getItem('id_token');
   console.log(token);
   ```
4. Si está vacío, intenta iniciar sesión de nuevo

### Error al intercambiar código

**Causa:** Problema con el endpoint de token

**Solución:**
1. Verifica que `VITE_COGNITO_TOKEN_ENDPOINT` sea correcto
2. Debe ser: `https://tu-dominio.auth.region.amazoncognito.com/oauth2/token`
3. Asegúrate de que tenga `/oauth2/token` al final

## Documentación Oficial

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Cognito Authentication Flow](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow.html)
- [OAuth 2.0 Authorization Code Flow](https://datatracker.ietf.org/doc/html/rfc6749#section-1.3.1)
- [OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html)

## Checklist Final

- [ ] Accedí a AWS Cognito
- [ ] Creé o seleccioné un User Pool
- [ ] Configuré un App Client
- [ ] Configuré las URLs de callback
- [ ] Copié el Client ID
- [ ] Copié el Cognito Domain
- [ ] Actualicé `.env.local` con mis credenciales
- [ ] Ejecuté `npm run dev`
- [ ] Hice clic en "Iniciar Sesión"
- [ ] Completé el login en Cognito
- [ ] Vi mi Dashboard con mis datos ✓

¡Listo! Tu aplicación está autenticada con Cognito. 🎉

