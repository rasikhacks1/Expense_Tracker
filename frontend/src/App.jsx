/**
 * App.jsx
 * Root application component — layout wrapper with Sidebar + Navbar + Routes.
 */

import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AlertProvider } from './context/AlertContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AlertProvider>
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            <Navbar />
            <AppRoutes />
          </div>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(26,26,46,0.98)',
              color: '#f0f0ff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif',
              backdropFilter: 'blur(20px)',
            },
            success: {
              iconTheme: { primary: '#06d6a0', secondary: 'rgba(26,26,46,0.98)' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: 'rgba(26,26,46,0.98)' },
            },
          }}
        />
      </AlertProvider>
    </BrowserRouter>
  );
}
