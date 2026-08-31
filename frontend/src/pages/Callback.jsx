import React, { useEffect } from 'react';
import { useAuth0 } from '../context/Auth0Context';
import './Callback.css';

export const Callback = () => {
  const { loading } = useAuth0();

  return (
    <div className="callback-container">
      <div className="spinner"></div>
      <h1>Procesando autenticación...</h1>
      <p>Por favor espera mientras completamos tu inicio de sesión</p>
    </div>
  );
};

export default Callback;
