import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import { Usuarios } from './pages/Usuarios';
import { Dashboard } from './pages/Dashboard';
import { Anuncios } from './pages/Anuncios';
import { Valoraciones } from './pages/Valoraciones';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/login" element={<Login />} />

          {/* RUTAS PRIVADAS */}
          <Route element={<ProtectedRoute />}>
              {/* Todas las rutas aquí dentro requieren token. El Layout las envuelve. */}
              <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard/>} />
                  <Route path="/usuarios" element={<Usuarios/>} />
                  <Route path="/anuncios" element={<Anuncios/>} />
                  <Route path='/valoraciones' element={<Valoraciones/>}/>
              </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;