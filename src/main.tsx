// filepath: c:\Users\Do Thanh Cong\safe-driving\src\main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initNotification } from './firebase/firebase-messaging';

// Khởi tạo Firebase messaging
initNotification();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);