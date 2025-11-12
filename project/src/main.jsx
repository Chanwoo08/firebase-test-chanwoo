import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { StudyProvider } from './context/StudyContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <StudyProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StudyProvider>
    </AuthProvider>
  </React.StrictMode>
);
