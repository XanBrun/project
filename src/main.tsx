import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Check Web Bluetooth API support
const isWebBluetoothSupported = () => {
  if (!navigator.bluetooth) {
    console.warn('Web Bluetooth API is not supported in this browser');
    return false;
  }
  return true;
};

// Show notification if Web Bluetooth is not supported
if (!isWebBluetoothSupported()) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 1rem;
    right: 1rem;
    padding: 1rem;
    background-color: #f59e0b;
    color: white;
    border-radius: 0.5rem;
    z-index: 50;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    max-width: 300px;
  `;
  notification.textContent = 'Web Bluetooth no está soportado en este navegador. Algunas funciones pueden no estar disponibles.';
  document.body.appendChild(notification);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);