import React from 'react';
import { useAuth0 } from '../context/Auth0Context';
import './Login.css';

export const Login = () => {
  const { login, loading } = useAuth0();

  return (
    <div className="login-container">
      <h1>Bienvenido</h1>
      <p>Inicia sesión con tu cuenta Auth0</p>
      <button 
        onClick={login} 
        disabled={loading}
        className="login-button"
      >
        {loading ? 'Cargando...' : 'Iniciar Sesión'}
      </button>
    </div>
  );
};

export default Login;
