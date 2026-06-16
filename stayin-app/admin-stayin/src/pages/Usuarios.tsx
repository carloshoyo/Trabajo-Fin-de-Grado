import { useState, useEffect } from 'react';
import { adminApi } from '../api/axios';

interface Usuario {
    id_usuario: number;
    username: string;
    email: string;
    nombre: string;
    apellidos: string;
    rol: string;
}

export const Usuarios = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estado para el buscador
    const [terminoBusqueda, setTerminoBusqueda] = useState('');

    // Estados para el Modal y el Formulario
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        name: '',
        apellidos: '',
        password: '',
        rol: 'Inquilino',
        birth_date: '',
        gender: 'Prefiero no decirlo'
    });

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const respuesta = await adminApi.get('/admin/usuarios');
                if (respuesta.data.success) {
                    setUsuarios(respuesta.data.usuarios);
                }
            } catch (err: any) {
                setError('Error al cargar la lista de usuarios.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsuarios();
    }, []);

    const borrarUsuario = async (id_usuario: number) => {
        const confirmado = window.confirm(`¿Estás seguro de que quieres borrar al usuario con id ${id_usuario}? Esta acción es irreversible.`);
        if (!confirmado) return;

        try {
            setError('');
            setSuccess('');
            const respuesta = await adminApi.post('/borrar/usuario', {
                id_usuario: id_usuario
            });
            if(respuesta.data.success) {
                setSuccess(`Usuario con id ${id_usuario} eliminado correctamente`);
                setUsuarios(usuarios.filter(user => user.id_usuario !== id_usuario));
            }
        } catch(error: any) {
            console.error('Error: ', error);
            setError(error.response?.data?.message || `No se ha podido eliminar al usuario con id ${id_usuario}.`);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCrearUsuario = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const respuesta = await adminApi.post('/admin/usuarios/crear', formData);
            
            if (respuesta.data.success) {
                setSuccess('Usuario creado correctamente.');
                setIsModalOpen(false);
                
                setFormData({
                    username: '', email: '', name: '', apellidos: '', password: '', rol: 'Inquilino', birth_date: '', gender: 'Prefiero no decirlo'
                });

                const nuevoUsuario: Usuario = {
                    id_usuario: respuesta.data.id_usuario || Date.now(), 
                    username: formData.username,
                    email: formData.email,
                    nombre: formData.name,
                    apellidos: formData.apellidos,
                    rol: formData.rol
                };

                setUsuarios([nuevoUsuario, ...usuarios]);
            }
        } catch (error: any) {
            console.error('Error al crear usuario:', error);
            setError(error.response?.data?.message || 'Error al crear el usuario. Revisa los datos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // LÓGICA DEL BUSCADOR: Filtramos el array antes de renderizar
    const usuariosFiltrados = usuarios.filter((user) => {
        const busqueda = terminoBusqueda.toLowerCase();
        return (
            user.nombre.toLowerCase().includes(busqueda) ||
            user.apellidos.toLowerCase().includes(busqueda) ||
            user.username.toLowerCase().includes(busqueda) ||
            user.email.toLowerCase().includes(busqueda) ||
            user.rol.toLowerCase().includes(busqueda)
        );
    });

    if (isLoading) return <div className="text-gray-600 text-xl">Cargando usuarios...</div>;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 relative">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
                    {success}
                </div>
            )}
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                        {terminoBusqueda ? `${usuariosFiltrados.length} / ${usuarios.length}` : `Total: ${usuarios.length}`}
                    </span>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email, rol..."
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                            className="w-full pl-3 pr-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                        + Nuevo Usuario
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-gray-600 font-bold">ID</th>
                            <th className="px-6 py-4 text-gray-600 font-bold">Usuario</th>
                            <th className="px-6 py-4 text-gray-600 font-bold">Email</th>
                            <th className="px-6 py-4 text-gray-600 font-bold">Rol</th>
                            <th className="px-6 py-4 text-gray-600 font-bold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.length > 0 ? (
                            usuariosFiltrados.map((user) => (
                                <tr key={user.id_usuario} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-700">#{user.id_usuario}</td>
                                    <td className="px-6 py-4 text-gray-800">
                                        <div className="font-bold">{user.nombre} {user.apellidos}</div>
                                        <div className="text-xs text-gray-500">@{user.username}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${user.rol === 'Administrador' ? 'bg-purple-100 text-purple-700' : 
                                              user.rol === 'Casero' ? 'bg-green-100 text-green-700' : 
                                              'bg-blue-100 text-blue-700'}`}
                                        >
                                            {user.rol}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => borrarUsuario(user.id_usuario)}
                                            className="text-red-500 hover:text-red-700 font-semibold px-3 py-1 border border-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No se han encontrado usuarios que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Creación de Usuario */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800 cursor-pointer">Añadir Nuevo Usuario</h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-800 font-bold text-xl cursor-pointer"
                            >
                                &times;
                            </button>
                        </div>
                        
                        <form onSubmit={handleCrearUsuario} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-1">Nombre</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                                        className="border rounded w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-1">Apellidos</label>
                                    <input type="text" name="apellidos" value={formData.apellidos} onChange={handleInputChange} required
                                        className="border rounded w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-1">Username</label>
                                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} required
                                        className="border rounded w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-1">Rol</label>
                                    <select name="rol" value={formData.rol} onChange={handleInputChange}
                                        className="border cursor-pointer rounded w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                        <option value="Inquilino">Inquilino</option>
                                        <option value="Casero">Casero</option>
                                        <option value="Administrador">Administrador</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-1">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required
                                    className="border rounded w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-1">Contraseña</label>
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required minLength={6}
                                    className="border rounded w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-1">Fecha Nacimiento</label>
                                    <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} required
                                        className="border rounded w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-1">Género</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange}
                                        className="border rounded w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer">
                                        <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                                        <option value="Hombre">Hombre</option>
                                        <option value="Mujer">Mujer</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className={`font-bold py-2 px-4 rounded text-white cursor-pointer ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {isSubmitting ? 'Creando...' : 'Guardar Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};