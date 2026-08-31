/**
 * Cliente de Cognito para manejar Authorization Code Flow
 * Detecta y valida el código de autorización en la URL
 */

// Configuración de Cognito
export const cognito = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  redirectUri: import.meta.env.VITE_AUTH0_CALLBACK_URL,
  tokenEndpoint: import.meta.env.VITE_COGNITO_TOKEN_ENDPOINT,
  jwksUri: import.meta.env.VITE_COGNITO_JWKS_URI,
};

/**
 * Obtiene el código de autorización de la URL
 * @returns {string|null} El código o null si no existe
 */
export const getAuthorizationCode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('code');
};

/**
 * Obtiene el estado de la URL (para validar la sesión)
 * @returns {string|null} El estado o null si no existe
 */
export const getStateFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('state');
};

/**
 * Guarda el estado en localStorage para validar después
 * @param {string} state - El estado a guardar
 */
export const saveState = (state) => {
  localStorage.setItem('auth_state', state);
};

/**
 * Obtiene el estado guardado
 * @returns {string|null} El estado guardado
 */
export const getSavedState = () => {
  return localStorage.getItem('auth_state');
};

/**
 * Limpia el estado guardado
 */
export const clearState = () => {
  localStorage.removeItem('auth_state');
};

/**
 * Intercambia el código de autorización por un token
 * @param {string} code - El código de autorización
 * @returns {Promise<{access_token, id_token, token_type}>} Los tokens
 */
export const exchangeCodeForToken = async (code) => {
  try {
    const response = await fetch(cognito.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: cognito.clientId,
        code: code,
        redirect_uri: cognito.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

/**
 * Guarda el token en localStorage
 * @param {string} token - El token a guardar
 */
export const saveToken = (token) => {
  localStorage.setItem('access_token', token);
};

/**
 * Obtiene el token guardado
 * @returns {string|null} El token
 */
export const getToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Limpia el token
 */
export const clearToken = () => {
  localStorage.removeItem('access_token');
};

/**
 * Guarda el ID token
 * @param {string} token - El ID token
 */
export const saveIdToken = (token) => {
  localStorage.setItem('id_token', token);
};

/**
 * Obtiene el ID token
 * @returns {string|null} El ID token
 */
export const getIdToken = () => {
  return localStorage.getItem('id_token');
};

/**
 * Decodifica un JWT (sin verificar firma)
 * NOTA: Esta es una decodificación básica, no verifica la firma
 * Para producción, verifica la firma contra JWKS
 * @param {string} token - El JWT a decodificar
 * @returns {Object} El payload del token
 */
export const decodeToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Obtiene la información del usuario desde el ID token
 * @returns {Object|null} La información del usuario
 */
export const getUserFromToken = () => {
  const idToken = getIdToken();
  if (!idToken) {
    return null;
  }

  const decoded = decodeToken(idToken);
  return decoded;
};

/**
 * Verifica si el token ha expirado
 * @param {string} token - El token a verificar
 * @returns {boolean} True si ha expirado
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Genera una URL de login de Cognito
 * @returns {string} La URL de login
 */
export const getLoginUrl = () => {
  const state = Math.random().toString(36).substring(7);
  saveState(state);

  const params = new URLSearchParams({
    client_id: cognito.clientId,
    response_type: 'code',
    scope: 'openid email profile',
    redirect_uri: cognito.redirectUri,
    state: state,
  });

  const loginUrl = `${cognito.domain}/oauth2/authorize?${params.toString()}`;
  
  // Log para debugging
  console.log('🔐 Login URL generada:');
  console.log('Domain:', cognito.domain);
  console.log('Client ID:', cognito.clientId);
  console.log('Redirect URI:', cognito.redirectUri);
  console.log('URL completa:', loginUrl);
  
  return loginUrl;
};

/**
 * Genera una URL de logout de Cognito
 * @returns {string} La URL de logout
 */
export const getLogoutUrl = () => {
  clearToken();
  clearIdToken();
  clearState();

  const params = new URLSearchParams({
    client_id: cognito.clientId,
    logout_uri: import.meta.env.VITE_AUTH0_LOGOUT_URL,
  });

  return `${cognito.domain}/logout?${params.toString()}`;
};

/**
 * Limpia el ID token
 */
export const clearIdToken = () => {
  localStorage.removeItem('id_token');
};

export default {
  cognito,
  getAuthorizationCode,
  getStateFromUrl,
  saveState,
  getSavedState,
  clearState,
  exchangeCodeForToken,
  saveToken,
  getToken,
  clearToken,
  saveIdToken,
  getIdToken,
  decodeToken,
  getUserFromToken,
  isTokenExpired,
  getLoginUrl,
  getLogoutUrl,
};

