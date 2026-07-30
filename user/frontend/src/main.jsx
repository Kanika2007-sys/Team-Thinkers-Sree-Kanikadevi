import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { AppDataProvider } from './context/AppDataContext';
import { AuthProvider } from './context/AuthContext';
import ToastHost from './components/ui/ToastHost';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <WebSocketProvider>
        <AuthProvider>
          <AppDataProvider>
            <ToastHost />
            <App />
          </AppDataProvider>
        </AuthProvider>
      </WebSocketProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
