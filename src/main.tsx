import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initNotification } from './firebase/firebase-messaging';
import { AuthProvider } from './contexts/AuthContext';


initNotification();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);


