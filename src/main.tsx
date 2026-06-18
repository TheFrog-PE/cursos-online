if (window.location.hash.startsWith('#ticket-')) {
  const ticketId = window.location.hash.replace('#ticket-', '');
  window.location.replace(`/ticket/${ticketId}`);
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
