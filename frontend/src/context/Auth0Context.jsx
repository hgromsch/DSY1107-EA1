import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getAuthorizationCode,
  getStateFromUrl,
  getSavedState,
  clearState,
  exchangeCodeForToken,
  saveToken,
  getToken,
  clearToken,
  saveIdToken,
  getIdToken,
  clearIdToken,
  getUserFromToken,
  isTokenExpired,
  getLoginUrl,
  getLogoutUrl,
} from '../auth0Client';

const Auth0Context = createContext();

export const Auth0Provider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Verificar si hay un código en la URL (callback desde Cognito)
        const code = getAuthorizationCode();
        const stateFromUrl = getStateFromUrl();
        const savedState = getSavedState();

        if (code && stateFromUrl) {
          // Validar que el estado coincida (protección CSRF)
          if (stateFromUrl !== savedState) {
            throw new Error('State mismatch - possible CSRF attack');
          }

          // Intercambiar el código por un token
          const tokens = await exchangeCodeForToken(code);

          // Guardar tokens
          saveToken(tokens.access_token);
          if (tokens.id_token) {
            saveIdToken(tokens.id_token);
          }

          setAccessToken(tokens.access_token);

          // Limpiar el estado
          clearState();

          // Obtener información del usuario desde el ID token
          const userData = getUserFromToken();
          setUser(userData);
          setIsAuthenticated(true);

          // Limpiar la URL (remover código y estado)
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          // No hay código en URL, verificar si ya hay un token guardado
          const savedToken = getToken();
          const savedIdToken = getIdToken();

          if (savedToken && !isTokenExpired(savedToken)) {
            // Token válido, obtener usuario
            setAccessToken(savedToken);
            const userData = getUserFromToken();
            setUser(userData);
            setIsAuthenticated(true);
          } else if (savedToken) {
            // Token expirado
            clearToken();
            clearIdToken();
            clearState();
            setIsAuthenticated(false);
            setUser(null);
            setAccessToken(null);
          }
        }
      } catch (err) {
        console.error('Error during authentication:', err);
        setError(err);
        setIsAuthenticated(false);
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = () => {
    try {
      const loginUrl = getLoginUrl();
      window.location.href = loginUrl;
    } catch (err) {
      setError(err);
      console.error('Error during login:', err);
    }
  };

  const logout = () => {
    try {
      clearToken();
      clearIdToken();
      clearState();
      setIsAuthenticated(false);
      setUser(null);
      setAccessToken(null);

      const logoutUrl = getLogoutUrl();
      window.location.href = logoutUrl;
    } catch (err) {
      setError(err);
      console.error('Error during logout:', err);
    }
  };

  const getAccessToken = () => {
    return accessToken;
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    getAccessToken,
    accessToken,
  };

  return (
    <Auth0Context.Provider value={value}>
      {children}
    </Auth0Context.Provider>
  );
};

export const useAuth0 = () => {
  const context = useContext(Auth0Context);
  if (!context) {
    throw new Error('useAuth0 debe ser usado dentro de un Auth0Provider');
  }
  return context;
};

