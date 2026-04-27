import React from 'react';
import ReactDOM from 'react-dom/client';
import GestorCentralApp from './GestorCentralApp';
import { BrowserRouter } from 'react-router-dom';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GestorCentralApp />
    </BrowserRouter>
  </React.StrictMode>
);