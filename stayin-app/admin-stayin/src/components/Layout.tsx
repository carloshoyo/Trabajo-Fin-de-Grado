import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const Layout = () => {
    const navigate = useNavigate();

    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
            <aside style={{ 
                width: '250px', 
                backgroundColor: '#1f2937', 
                color: 'white', 
                display: 'flex', 
                flexDirection: 'column' 
            }}>
                <div style={{ padding: '20px', fontSize: '24px', fontWeight: 'bold', borderBottom: '1px solid #374151' }}>
                    StayIn Admin
                </div>
                
                <nav style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <Link to="/" className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md transition-colors text-base font-medium">📊 Dashboard</Link>
                    <Link to="/usuarios" className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md transition-colors text-base font-medium">👥 Usuarios</Link>
                    <Link to="/anuncios" className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md transition-colors text-base font-medium">🏠 Anuncios</Link>
                    <Link to="/valoraciones" className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md transition-colors text-base font-medium">⭐ Valoraciones</Link>
                </nav>

                <div style={{ padding: '20px', borderTop: '1px solid #374151' }}>
                    <button 
                        onClick={handleLogout}
                        style={{ width: '100%', padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </aside>
            <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <Outlet /> 
            </main>
        </div>
    );
};