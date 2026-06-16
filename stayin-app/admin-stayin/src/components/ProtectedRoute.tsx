import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = () => {
    const { isAuthenticated } = useContext(AuthContext);

    // Si no está autenticado, lo redirigimos a /login y reemplazamos el historial
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si tiene token, renderizamos el contenido hijo (el layout)
    return <Outlet />;
};