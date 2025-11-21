import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({
	children,
	requiredRole,
}: {
	children: React.ReactNode;
	requiredRole?: 'admin' | 'user';
}) => {
	const { isAuthenticated, isAdmin } = useAuth();

	if (!isAuthenticated) return <Navigate to="/login" replace />;

	if (requiredRole === 'admin' && !isAdmin) {
		return <Navigate to="/home" replace />;
	}

	return <>{children}</>;
};