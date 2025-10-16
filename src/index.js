import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import {AlertProvider} from './context/AlertContext'
import { LoadingProvider } from './context/LoadingContext'
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AlertProvider>
        <FilterProvider>
          <LoadingProvider>
            <App />
          </LoadingProvider>
        </FilterProvider>
        </AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
