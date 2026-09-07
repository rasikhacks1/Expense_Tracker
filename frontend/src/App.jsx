import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar/Navbar';
import AppRoutes from './routes/AppRoutes';


export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <div className="page-content">
          <AppRoutes />
        </div>
      </div>

      {/* Toast notification container */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(22, 22, 42, 0.98)',
            color: '#f0f0ff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#06d6a0', secondary: 'rgba(22,22,42,0.98)' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: 'rgba(22,22,42,0.98)' },
          },
        }}
      />
    </BrowserRouter>
  );
}
