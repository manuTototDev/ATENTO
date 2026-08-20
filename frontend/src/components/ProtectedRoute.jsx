import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * Guardia de rutas del lado del cliente.
 * Si no hay token de sesión, redirige a /login conservando a dónde quería ir el usuario.
 *
 * Nota: esto es UX, no seguridad — la seguridad real la aplica el backend
 * validando el JWT en cada endpoint. Este guard solo evita renderizar
 * una app vacía a un visitante anónimo.
 */
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
