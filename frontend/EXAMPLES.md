# Ejemplos de Código - AWS Cognito + React

Ejemplos prácticos de cómo usar la autenticación con Cognito en tu aplicación React.

## 1. Hook useAuth0() - Lo Básico

```jsx
import { useAuth0 } from './context/Auth0Context';

function MiComponente() {
  const { isAuthenticated, user, login, logout } = useAuth0();

  if (!isAuthenticated) {
    return <button onClick={login}>Iniciar Sesión</button>;
  }

  return (
    <div>
      <h1>Bienvenido, {user.name}!</h1>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

## 2. Mostrar Información del Usuario

```jsx
import { useAuth0 } from './context/Auth0Context';

function PerfilUsuario() {
  const { user, isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return <p>Por favor inicia sesión</p>;
  }

  return (
    <div>
      <h2>{user.name}</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Email verificado:</strong> {user.email_verified ? 'Sí' : 'No'}</p>
      <p><strong>ID de usuario:</strong> {user.sub}</p>
    </div>
  );
}
```

## 3. Botón de Login/Logout

```jsx
import { useAuth0 } from './context/Auth0Context';

function AuthButton() {
  const { isAuthenticated, user, login, logout, loading } = useAuth0();

  if (loading) {
    return <button disabled>Cargando...</button>;
  }

  if (!isAuthenticated) {
    return (
      <button onClick={login} style={{ padding: '10px 20px' }}>
        Iniciar Sesión
      </button>
    );
  }

  return (
    <div>
      <p>Hola, {user.name}</p>
      <button onClick={logout} style={{ padding: '10px 20px' }}>
        Cerrar Sesión
      </button>
    </div>
  );
}
```

## 4. Proteger Rutas

```jsx
import { useAuth0 } from './context/Auth0Context';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated, loading } = useAuth0();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Perfil />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## 5. Llamadas a APIs Protegidas

```jsx
import { useAuth0 } from './context/Auth0Context';
import { useEffect, useState } from 'react';

function MisData() {
  const { accessToken, isAuthenticated } = useAuth0();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const response = await fetch('https://tu-api.com/datos', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener datos');
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, accessToken]);

  if (!isAuthenticated) {
    return <p>Por favor inicia sesión</p>;
  }

  if (loading) {
    return <p>Cargando...</p>;
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

## 6. Manejo de Errores

```jsx
import { useAuth0 } from './context/Auth0Context';

function ErrorDisplay() {
  const { error } = useAuth0();

  if (!error) {
    return null;
  }

  return (
    <div style={{ 
      background: '#ffebee', 
      color: '#c62828', 
      padding: '15px',
      borderRadius: '4px',
      marginBottom: '15px'
    }}>
      <strong>Error de autenticación:</strong> {error}
    </div>
  );
}
```

## 7. Componente de Login Personalizado

```jsx
import { useAuth0 } from './context/Auth0Context';

function CustomLogin() {
  const { login, isAuthenticated, user } = useAuth0();

  if (isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Bienvenido, {user.name}!</h1>
        <p>Email: {user.email}</p>
      </div>
    );
  }

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1>Mi Aplicación</h1>
      <p>Autenticación con AWS Cognito</p>
      <button 
        onClick={login}
        style={{
          padding: '12px 30px',
          fontSize: '16px',
          background: 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Iniciar Sesión
      </button>
    </div>
  );
}
```

## 8. Estado de Carga Personalizado

```jsx
import { useAuth0 } from './context/Auth0Context';

function App() {
  const { loading, error } = useAuth0();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{
          animation: 'spin 1s linear infinite',
          width: '40px',
          height: '40px',
          border: '4px solid #ccc',
          borderTop: '4px solid #333',
          borderRadius: '50%',
          margin: '0 auto'
        }}></div>
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        <h2>Error de autenticación</h2>
        <p>{error}</p>
      </div>
    );
  }

  return <AppContent />;
}
```

## 9. Actualizar Perfil del Usuario

```jsx
import { useAuth0 } from './context/Auth0Context';
import { useState } from 'react';

function ActualizarPerfil() {
  const { user, accessToken } = useAuth0();
  const [nombre, setNombre] = useState(user?.name || '');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://tu-api.com/perfil', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: nombre }),
      });

      if (response.ok) {
        setMensaje('Perfil actualizado correctamente');
      } else {
        setMensaje('Error al actualizar perfil');
      }
    } catch (error) {
      setMensaje(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Actualizar Perfil</h2>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Tu nombre"
      />
      <button type="submit">Guardar</button>
      {mensaje && <p>{mensaje}</p>}
    </form>
  );
}
```

## 10. Verificar Tokens

```jsx
import { useAuth0 } from './context/Auth0Context';

function VerificarTokens() {
  const { accessToken } = useAuth0();

  const handleVerify = () => {
    if (!accessToken) {
      console.log('No hay token disponible');
      return;
    }

    // Decodificar el access token (si es JWT)
    try {
      const parts = accessToken.split('.');
      if (parts.length !== 3) {
        console.log('No es un JWT válido');
        return;
      }

      const payload = JSON.parse(atob(parts[1]));
      console.log('Access Token Payload:', payload);

      // Verificar expiración
      const ahora = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp > ahora) {
        console.log('Token válido, expira en:', new Date(payload.exp * 1000));
      } else {
        console.log('Token expirado');
      }
    } catch (error) {
      console.error('Error al decodificar:', error);
    }
  };

  return (
    <div>
      <button onClick={handleVerify}>Verificar Tokens</button>
      <p>Abre la consola (F12) para ver los detalles</p>
    </div>
  );
}
```

## 11. Logout con Redirección

```jsx
import { useAuth0 } from './context/Auth0Context';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const { logout } = useAuth0();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Navegar a home después de logout
    navigate('/');
  };

  return <button onClick={handleLogout}>Cerrar Sesión</button>;
}
```

## 12. Interceptor para Requests HTTP

```jsx
import { useAuth0 } from './context/Auth0Context';
import { useEffect } from 'react';

function HTTPInterceptor() {
  const { accessToken } = useAuth0();

  useEffect(() => {
    // Crear un fetch wrapper que automáticamente agrega el token
    const originalFetch = window.fetch;

    window.fetch = function(...args) {
      const [resource, config] = args;
      const newConfig = config || {};

      // Agregar Authorization header si no existe
      if (!newConfig.headers) {
        newConfig.headers = {};
      }

      if (accessToken && !newConfig.headers.Authorization) {
        newConfig.headers.Authorization = `Bearer ${accessToken}`;
      }

      return originalFetch.apply(this, [resource, newConfig]);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [accessToken]);

  return null; // Este componente solo agrega el interceptor
}

// Usar en tu App:
function App() {
  return (
    <>
      <HTTPInterceptor />
      {/* resto de tu app */}
    </>
  );
}
```

## 13. Contexto Personalizado con Datos Adicionales

```jsx
import { useAuth0 } from './context/Auth0Context';
import { createContext, useContext, useState, useEffect } from 'react';

const UserDataContext = createContext();

export function UserDataProvider({ children }) {
  const { user, accessToken } = useAuth0();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !accessToken) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch('https://tu-api.com/usuario-completo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, accessToken]);

  return (
    <UserDataContext.Provider value={{ userData, loading }}>
      {children}
    </UserDataContext.Provider>
  );
}

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData debe ser usado dentro de UserDataProvider');
  }
  return context;
};
```

## 14. Reintentos Automáticos en APIs

```jsx
import { useAuth0 } from './context/Auth0Context';

function fetchConReintentos(url, options = {}, maxReintentos = 3) {
  return fetch(url, options)
    .then(response => {
      if (response.status === 401 && maxReintentos > 0) {
        // Token expirado, reintentar
        return fetchConReintentos(url, options, maxReintentos - 1);
      }
      return response;
    });
}

function MiComponenteConReintentos() {
  const { accessToken } = useAuth0();

  const handleFetch = async () => {
    const response = await fetchConReintentos(
      'https://tu-api.com/datos',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    console.log(data);
  };

  return <button onClick={handleFetch}>Obtener Datos</button>;
}
```

## 15. Verificar Permisos del Usuario

```jsx
import { useAuth0 } from './context/Auth0Context';

function RequierePermiso({ permiso, children }) {
  const { user, isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return <p>Por favor inicia sesión</p>;
  }

  // Suponiendo que el id_token contiene un campo 'permisos'
  const permisos = user?.['custom:permisos']?.split(',') || [];

  if (!permisos.includes(permiso)) {
    return <p>No tienes permiso para acceder a esto</p>;
  }

  return children;
}

// Uso:
function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <RequierePermiso permiso="admin">
        <button>Panel de Administración</button>
      </RequierePermiso>

      <RequierePermiso permiso="editar">
        <button>Editar Contenido</button>
      </RequierePermiso>
    </div>
  );
}
```

---

## Más Ejemplos

Para más ejemplos y documentación:

- **[README.md](README.md)** - Documentación general
- **[QUICKSTART.md](QUICKSTART.md)** - Inicio rápido
- **[COGNITO_FLOW.md](COGNITO_FLOW.md)** - Explicación del flujo
- **[CODE_VALIDATION.md](CODE_VALIDATION.md)** - Validación del código
- **[SETUP.md](SETUP.md)** - Configuración detallada

¡Usa estos ejemplos como base para tu aplicación! 🚀
