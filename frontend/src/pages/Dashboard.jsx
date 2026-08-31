import React, { useEffect, useState } from 'react';
import { useAuth0 } from '../context/Auth0Context';
import './Dashboard.css';

export const Dashboard = () => {
  const { user, getAccessToken } = useAuth0();
  const [accessToken, setAccessToken] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [customApiUrl, setCustomApiUrl] = useState('https://cprkcxlhm4.execute-api.us-east-1.amazonaws.com/datos');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [requestConfig, setRequestConfig] = useState({
    includeAuth: true,
    includeContentType: true,
    includeAccept: true,
    mode: 'cors',
    credentials: 'omit', // Cambiar de 'include' a 'omit'
    useQueryParam: false,
  });
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const fetchAccessToken = async () => {
      const token = await getAccessToken();
      setAccessToken(token);
    };

    fetchAccessToken();
  }, [getAccessToken]);

  // Función para reintentar la llamada a la API
  const retryFetch = async () => {
    await fetchApiData();
  };

  // Función para probar múltiples configuraciones de headers
  const testMultipleConfigs = async () => {
    const token = await getAccessToken();
    const results = [];

    const configs = [
      { name: '1. Solo Authorization (CORS)', headers: { 'Authorization': `Bearer ${token}` }, credentials: 'omit' },
      { name: '2. Auth + Content-Type', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, credentials: 'omit' },
      { name: '3. Auth + Accept', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }, credentials: 'omit' },
      { name: '4. Todos los headers', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' }, credentials: 'omit' },
      { name: '5. Sin Authorization', headers: {}, credentials: 'omit' },
      { name: '6. Solo Authorization (no-cors)', headers: { 'Authorization': `Bearer ${token}` }, credentials: 'omit', mode: 'no-cors' },
      { name: '7. Token en Query Parameter', headers: {}, credentials: 'omit', useQueryParam: true },
    ];

    console.log('🧪 Iniciando prueba de configuraciones...');

    for (const config of configs) {
      try {
        let testUrl = customApiUrl;
        
        const options = {
          method: 'GET',
          mode: config.mode || 'cors',
          headers: config.headers,
        };

        if (config.credentials !== 'omit') {
          options.credentials = config.credentials;
        }

        // Si es query parameter, agregar al URL
        if (config.useQueryParam) {
          testUrl = testUrl.includes('?') 
            ? `${testUrl}&token=${encodeURIComponent(token)}`
            : `${testUrl}?token=${encodeURIComponent(token)}`;
          console.log(`\n${config.name}`);
          console.log('URL:', testUrl.substring(0, 80) + '...');
        } else {
          console.log(`\n${config.name}`);
          console.log('Headers:', config.headers);
        }

        const response = await fetch(testUrl, options);
        
        console.log(`✅ ${config.name} - Status: ${response.status}`);
        results.push({
          config: config.name,
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          time: new Date().toLocaleTimeString(),
        });

        if (response.ok) {
          console.log(`🎉 ¡FUNCIONA! Usar: ${config.name}`);
          // Guardar la primera que funcione para aplicar automáticamente
          if (!requestConfig.alreadyFoundWorking) {
            setRequestConfig({
              includeAuth: config.headers['Authorization'] ? true : false,
              includeContentType: config.headers['Content-Type'] ? true : false,
              includeAccept: config.headers['Accept'] ? true : false,
              mode: config.mode || 'cors',
              credentials: config.credentials,
              useQueryParam: config.useQueryParam || false,
              alreadyFoundWorking: true,
            });
          }
        }
      } catch (error) {
        console.error(`❌ ${config.name} - ${error.message}`);
        results.push({
          config: config.name,
          status: 'ERROR',
          ok: false,
          statusText: error.message,
          time: new Date().toLocaleTimeString(),
        });
      }
    }

    setTestResults(results);
  };

  // Fetch datos de la API
  const fetchApiData = async () => {
    try {
      setApiLoading(true);
      setApiError(null);
      setDebugInfo(null);

      const token = await getAccessToken();
      
      const apiUrl = customApiUrl;
      
      console.log('🔍 Iniciando fetch a la API...');
      console.log('URL:', apiUrl);
      console.log('Token:', token.substring(0, 50) + '...');
      console.log('Origen actual:', window.location.origin);
      
      setDebugInfo({
        token: token.substring(0, 50) + '...',
        timestamp: new Date().toLocaleTimeString(),
        url: apiUrl,
        origin: window.location.origin,
      });

      // Intentar con Authorization header
      console.log('📤 Enviando request...');
      
      let fetchUrl = apiUrl;
      const fetchOptions = {
        method: 'GET',
        mode: requestConfig.mode,
        headers: {},
      };
      
      // Si usamos query parameter
      if (requestConfig.useQueryParam) {
        fetchUrl = apiUrl.includes('?') 
          ? `${apiUrl}&token=${encodeURIComponent(token)}`
          : `${apiUrl}?token=${encodeURIComponent(token)}`;
        console.log('📋 Usando token en Query Parameter');
      } else {
        // Agregar headers según la configuración
        if (requestConfig.includeAuth) {
          fetchOptions.headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (requestConfig.includeContentType) {
          fetchOptions.headers['Content-Type'] = 'application/json';
        }
        
        if (requestConfig.includeAccept) {
          fetchOptions.headers['Accept'] = 'application/json';
        }
      }
      
      // Solo agregar credentials si no está en 'include'
      if (requestConfig.credentials !== 'omit') {
        fetchOptions.credentials = requestConfig.credentials;
      }
      
      console.log('📋 Request options:', fetchOptions);
      
      let response;
      try {
        response = await fetch(fetchUrl, fetchOptions);
      } catch (fetchError) {
        console.error('🚨 Error en fetch:', fetchError.message);
        console.error('🚨 Tipo de error:', fetchError.name);
        
        // Si falla con Authorization, intentar sin ella (para diagnosticar CORS)
        console.log('⚠️ Intentando sin Authorization header (para diagnosticar)...');
        try {
          const simpleResponse = await fetch(apiUrl, {
            method: 'GET',
            mode: 'cors',
          });
          console.log('✅ Fetch sin Authorization funcionó:', simpleResponse.status);
          console.log('💡 El problema es el Authorization header, no CORS');
        } catch (simpleError) {
          console.error('❌ También falla sin Authorization:', simpleError.message);
          console.error('💡 El problema es CORS o la URL/servidor');
        }
        
        throw fetchError;
      }

      console.log('📊 Status:', response.status);
      console.log('📊 StatusText:', response.statusText);
      console.log('📊 Headers CORS:', {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        'Content-Type': response.headers.get('Content-Type'),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorBody = '';
        
        if (contentType && contentType.includes('application/json')) {
          errorBody = await response.json();
        } else {
          errorBody = await response.text();
        }
        
        console.error('❌ Error Response:', errorBody);
        throw new Error(
          `Error en API (${response.status}): ${response.statusText}\n${
            typeof errorBody === 'string' ? errorBody : JSON.stringify(errorBody)
          }`
        );
      }

      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      setApiData(data);
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Tipo de error:', error.name);
      console.error('❌ Mensaje:', error.message);
      console.error('❌ Stack:', error.stack);
      
      // Diagnosticar el tipo de error
      let errorDiagnosis = '';
      
      if (error.message.includes('Failed to fetch')) {
        errorDiagnosis = '🚨 PROBLEMA DE CORS O CONECTIVIDAD:\n\n' +
          'Esto significa que el navegador bloqueó la solicitud.\n\n' +
          'Soluciones:\n' +
          '1. Verifica que AWS API Gateway tiene CORS habilitado:\n' +
          '   - Ve a API Gateway → tu API → CORS\n' +
          '   - Access-Control-Allow-Origin debe incluir http://localhost:5173\n\n' +
          '2. Verifica que el endpoint existe:\n' +
          '   - Prueba la URL en Postman/curl\n' +
          '   - curl -H "Authorization: Bearer TOKEN" URL\n\n' +
          '3. Verifica la red:\n' +
          '   - Abre DevTools → Network\n' +
          '   - Mira si hay una request (bloqueada por CORS)\n' +
          '   - O si no aparece nada (problema de red)';
      } else if (error.message.includes('unauthorized') || error.message.includes('403')) {
        errorDiagnosis = '🔐 PROBLEMA DE AUTORIZACIÓN:\n\n' +
          'El token no tiene permisos.\n\n' +
          'Soluciones:\n' +
          '1. Verifica que el token es válido\n' +
          '2. Verifica que tienes permisos en la API\n' +
          '3. Mira los logs de API Gateway en AWS CloudWatch';
      } else if (error.message.includes('404')) {
        errorDiagnosis = '❌ ENDPOINT NO ENCONTRADO:\n\n' +
          'La URL no existe o está mal configurada.\n\n' +
          'Verifica:\n' +
          '1. La URL es correcta: https://cprkcxlhm4.execute-api.us-east-1.amazonaws.com/datos\n' +
          '2. El endpoint está publicado en AWS API Gateway\n' +
          '3. El stage es correcto (prod, dev, etc.)';
      }
      
      setApiError({
        message: error.message,
        type: error.name,
        details: error.toString(),
        diagnosis: errorDiagnosis,
      });
    } finally {
      setApiLoading(false);
    }
  };

  // Ejecutar fetch cuando el componente monta
  useEffect(() => {
    fetchApiData();
  }, [getAccessToken, customApiUrl, requestConfig]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Bienvenido, {user?.name}!</h1>
        
        {/* Controles de URL */}
        <section className="url-control-section">
          <button 
            className="toggle-url-btn"
            onClick={() => setShowUrlInput(!showUrlInput)}
          >
            ⚙️ {showUrlInput ? 'Ocultar' : 'Cambiar'} URL de API
          </button>
          
          {showUrlInput && (
            <div className="url-input-container">
              <label>URL de la API:</label>
              <input
                type="text"
                value={customApiUrl}
                onChange={(e) => setCustomApiUrl(e.target.value)}
                className="url-input"
                placeholder="https://..."
              />
              <button 
                onClick={() => setShowUrlInput(false)}
                className="url-close-btn"
              >
                ✓ Usar esta URL
              </button>
              
              <div className="url-presets">
                <p><strong>URLs rápidas:</strong></p>
                <button
                  onClick={() => setCustomApiUrl('https://cprkcxlhm4.execute-api.us-east-1.amazonaws.com/datos')}
                  className="preset-btn"
                >
                  /datos
                </button>
                <button
                  onClick={() => setCustomApiUrl('https://cprkcxlhm4.execute-api.us-east-1.amazonaws.com/')}
                  className="preset-btn"
                >
                  / (raíz)
                </button>
              </div>
            </div>
          )}
          
          {/* Panel de pruebas de configuración */}
          <div className="test-config-panel">
            <p><strong>🧪 Probar diferentes configuraciones de headers:</strong></p>
            <button 
              onClick={testMultipleConfigs}
              className="test-all-btn"
              disabled={apiLoading}
            >
              🔬 Probar todas las configuraciones
            </button>
            
            {testResults.length > 0 && (
              <div className="test-results">
                <h4>Resultados de pruebas:</h4>
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Configuración</th>
                      <th>Status</th>
                      <th>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((result, idx) => (
                      <tr key={idx} className={result.ok ? 'success' : 'error'}>
                        <td>{result.config}</td>
                        <td>{result.status}</td>
                        <td className={result.ok ? '✅' : '❌'}>{result.statusText}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
        
        {/* Sección de API - Primera (más prominente) */}
        <section className="api-section api-section-primary">
          <h2>📊 Datos de la API</h2>
          {apiLoading && (
            <div className="loading">
              <p>Cargando datos de la API...</p>
              <div className="spinner"></div>
            </div>
          )}
          {apiError && (
            <div className="error-message">
              <p><strong>❌ Error al cargar datos:</strong></p>
              <p className="error-details">{apiError.message || apiError}</p>
              
              {apiError.diagnosis && (
                <div className="error-diagnosis">
                  <p><strong>💡 Diagnóstico:</strong></p>
                  <pre>{apiError.diagnosis}</pre>
                </div>
              )}
              
              {apiError.details && (
                <details className="error-details-expanded">
                  <summary>📋 Detalles técnicos</summary>
                  <pre>{apiError.details}</pre>
                </details>
              )}
              
              <button onClick={retryFetch} className="retry-button">
                🔄 Reintentar
              </button>
            </div>
          )}
          {debugInfo && !apiData && (
            <div className="debug-info">
              <p><strong>Información de depuración:</strong></p>
              <div className="debug-item">
                <span>URL:</span>
                <code>{debugInfo.url}</code>
              </div>
              <div className="debug-item">
                <span>Token (primeros caracteres):</span>
                <code>{debugInfo.token}</code>
              </div>
              <div className="debug-item">
                <span>Hora:</span>
                <code>{debugInfo.timestamp}</code>
              </div>
            </div>
          )}
          {apiData && !apiLoading && (
            <div className="api-data">
              <pre>{JSON.stringify(apiData, null, 2)}</pre>
            </div>
          )}
        </section>

        <section className="user-section">
          <h2>Información del Usuario</h2>
          <div className="user-info-grid">
            <div className="info-item">
              <label>Nombre:</label>
              <p>{user?.name}</p>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <p>{user?.email}</p>
            </div>
            <div className="info-item">
              <label>ID de Usuario:</label>
              <p className="code">{user?.sub}</p>
            </div>
          </div>
        </section>

        {user?.picture && (
          <section className="picture-section">
            <h2>Avatar</h2>
            <img src={user.picture} alt={user.name} className="avatar" />
          </section>
        )}

        {accessToken && (
          <section className="token-section">
            <h2>Token de Acceso (primeros 50 caracteres)</h2>
            <p className="code token">{accessToken.substring(0, 50)}...</p>
            <p className="info-text">El token completo está disponible en la consola del navegador</p>
          </section>
        )}

        <section className="info-section">
          <h2>¿Cómo funciona?</h2>
          <div className="flow-steps">
            <div className="step">
              <h3>1. Authorization Code Flow</h3>
              <p>Se genera un code_verifier y code_challenge (PKCE)</p>
            </div>
            <div className="step">
              <h3>2. Redirección a Cognito</h3>
              <p>Se envía el code_challenge a Cognito</p>
            </div>
            <div className="step">
              <h3>3. Autenticación del Usuario</h3>
              <p>El usuario inicia sesión en Cognito</p>
            </div>
            <div className="step">
              <h3>4. Intercambio de Código</h3>
              <p>Se intercambia el código por tokens usando code_verifier</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
