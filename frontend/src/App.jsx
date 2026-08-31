import React from 'react';
import { Auth0Provider } from './context/Auth0Context';
import { useAuth0 } from './context/Auth0Context';
import Dashboard from './pages/Dashboard';
import Callback from './pages/Callback';
import Login from './components/Login';
import Logout from './components/Logout';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading, user, error } = useAuth0();

  // Mientras se carga la autenticación
  if (loading) {
    return <Callback />;
  }

  // Si hay un error, mostrarlo
  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ff6b6b' }}>
        <h1>Error de Autenticación</h1>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  // Si no está autenticado, muestra el login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Si está autenticado, muestra el dashboard y el botón de logout
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>Aplicación con Cognito</h1>
          <Logout />
        </div>
      </header>
      <main className="app-main">
        <Dashboard />
      </main>
    </div>
  );
}

function App() {
  return (
    <Auth0Provider>
      <AppContent />
    </Auth0Provider>
  );
}

export default App;
