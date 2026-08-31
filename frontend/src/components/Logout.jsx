import React from 'react';
import { useAuth0 } from '../context/Auth0Context';
import './Logout.css';

export const Logout = () => {
  const { user, logout, loading } = useAuth0();

  return (
    <div className="logout-container">
      <div className="user-info">
        {user?.picture && (
          <img 
            src={user.picture} 
            alt={user.name} 
            className="user-avatar"
          />
        )}
        <div className="user-details">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
        </div>
      </div>
      <button 
        onClick={logout}
        disabled={loading}
        className="logout-button"
      >
        {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
      </button>
    </div>
  );
};

export default Logout;
