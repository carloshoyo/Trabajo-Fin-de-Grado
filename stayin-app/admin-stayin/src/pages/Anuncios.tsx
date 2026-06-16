import { useState, useEffect } from 'react';
import { adminApi } from '../api/axios';

interface Anuncio {
    id_anuncio: number;
    titulo: string;
    precio: number;
    direccion: string;
    cpostal: string;
    casero_username: string;
    casero_email: string;
}

export const Anuncios = () => {
    const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estado para el buscador
    const [terminoBusqueda, setTerminoBusqueda] = useState('');

    useEffect(() => {
        const fetchAnuncios = async () => {
            try {
                const response = await adminApi.get('/admin/anuncios');
                if (response.data.success) {
                    setAnuncios(response.data.anuncios);
                }
            } catch (err: any) {
                setError('Error al cargar la lista de anuncios.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnuncios();
    }, []);

    const borrarAnuncio = async (id_anuncio: number) => {
        const confirmado = window.confirm(`¿Estás seguro de que quieres borrar al anuncio con id ${id_anuncio}?`);
        if(!confirmado) return;
        
        try {
            const respuesta = await adminApi.post('/borrar/anuncio', {
                id_anuncio: id_anuncio
            });
            if(respuesta.data.success) {
                setSuccess(`Anuncio con id ${id_anuncio} eliminado correctamente`);
                setAnuncios(anuncios.filter(ad => ad.id_anuncio !== id_anuncio));
            }
        } catch(error: any) {
            console.error('Error: ', error);
            setError(error.response?.data?.message || `No se ha podido eliminar al anuncio con id ${id_anuncio}.`);
        }
    }

    // LÓGICA DEL BUSCADOR
    const anunciosFiltrados = anuncios.filter((ad) => {
        const busqueda = terminoBusqueda.toLowerCase();
        return (
            (ad.titulo || '').toLowerCase().includes(busqueda) ||
            (ad.direccion || '').toLowerCase().includes(busqueda) ||
            (ad.cpostal || '').toLowerCase().includes(busqueda) ||
            (ad.casero_username || '').toLowerCase().includes(busqueda) ||
            (ad.casero_email || '').toLowerCase().includes(busqueda)
        );
    });

    if (isLoading) return <div className="text-gray-600 text-xl">Cargando anuncios...</div>;

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
                    <h2 className="text-2xl font-bold text-gray-800">Moderación de Anuncios</h2>
                    <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                        {terminoBusqueda ? `${anunciosFiltrados.length} / ${anuncios.length}` : `Total: ${anuncios.length}`}
                    </span>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Buscar por título, ubicación, propietario..."
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                            className="w-full pl-3 pr-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-gray-600 font-bold">ID</th>
                            <th className="px-6 py-4 text-gray-600 font-bold">Anuncio</th>
                            <th className="px-6 py-4 text-gray-600 font-bold">Ubicación</th>
                            <th className="px-6 py-4 text-gray-600 font-bold">Propietario</th>
                            <th className="px-6 py-4 text-gray-600 font-bold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {anunciosFiltrados.length > 0 ? (
                            anunciosFiltrados.map((ad) => (
                                <tr key={ad.id_anuncio} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-700">#{ad.id_anuncio}</td>
                                    <td className="px-6 py-4 text-gray-800">
                                        <div className="font-bold text-base truncate max-w-xs" title={ad.titulo}>
                                            {ad.titulo}
                                        </div>
                                        <div className="text-sm font-semibold text-green-600 mt-1">{ad.precio} €/mes</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div>{ad.direccion}</div>
                                        <div className="text-xs text-gray-400">CP: {ad.cpostal || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-800">
                                        <div className="font-semibold">@{ad.casero_username}</div>
                                        <div className="text-xs text-gray-500">{ad.casero_email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => borrarAnuncio(ad.id_anuncio)}
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
                                    No se encontraron anuncios que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};