import { useState, useEffect } from 'react';
import Calculator from './Calculator';
import { checkHealth } from './api';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const checkApi = async () => {
      const isHealthy = await checkHealth();
      setApiStatus(isHealthy ? 'connected' : 'disconnected');
    };

    checkApi();
    // Check every 30 seconds
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">
            <span className="title-icon">⚡</span>
            CalcuPro
          </h1>
          <div className={`api-status ${apiStatus}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {apiStatus === 'checking' && 'Connecting...'}
              {apiStatus === 'connected' && 'API Connected'}
              {apiStatus === 'disconnected' && 'API Offline'}
            </span>
          </div>
        </header>

        <Calculator />

        <footer className="app-footer">
          <p>Built with React + Express</p>
          <p className="footer-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
            <span className="divider">•</span>
            <span>Deployed on Vercel + Railway</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
