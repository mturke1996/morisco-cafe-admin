
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Coffee } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 islamic-pattern">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto shadow-2xl islamic-shadow animate-islamic-glow">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Coffee className="w-8 h-8 text-green-600 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-800 arabic-font">موريسكو كافيه</h2>
            <p className="text-green-600 arabic-font mt-2">جاري التحميل...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
