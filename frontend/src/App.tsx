import { Provider } from 'jotai';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthPage } from '@/components/auth/AuthPage';
import { Dashboard } from '@/components/Dashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from 'sonner';

function AppContent() {
  return (
    <ProtectedRoute fallback={<AuthPage />}>
      <Dashboard />
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Provider>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" />
      </AuthProvider>
    </Provider>
  );
}

export default App;