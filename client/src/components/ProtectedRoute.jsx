
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const styles = {
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
  },
};

export default ProtectedRoute;