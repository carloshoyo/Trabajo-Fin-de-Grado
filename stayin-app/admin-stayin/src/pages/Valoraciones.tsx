import { useState, useEffect } from 'react';
import { adminApi } from '../api/axios';

interface Valoracion {
    id_valoracion: number;
    comentario: string;
    id_estancia: number;
    autor_username: string;
    autor_rol: string;
    destinatario_username: string;
    destinatario_rol: string;
    oculto: boolean;
}

export const Valoraciones = () => {
    const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estado para el buscador
    const [terminoBusqueda, setTerminoBusqueda] = useState('');

    useEffect(() => {
        const fetchValoraciones = async () => {
            try {
                const respuesta = await adminApi.get('/admin/valoraciones');
                if (respuesta.data.success) {
                    setValoraciones(respuesta.data.valoraciones || []);
                }
            } catch (err: any) {
                setError('Error al cargar la lista de valoraciones.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchValoraciones();
    }, []);

    const alternarVisibilidad = async (id_valoracion: number, estadoActual: boolean) => {
        const accion = estadoActual ? 'mostrar' : 'ocultar';
        const confirmado = window.confirm(`¿Estás seguro de que quieres ${accion} esta valoración?`);
        
        if (!confirmado) return;

        try {
            setError('');
            setSuccess('');
            
            const respuesta = await adminApi.put('/admin/valoraciones/ocultar', {
                id_valoracion: id_valoracion,
                oculto: !estadoActual
            });
            
            if (respuesta.data.success) {
                setSuccess(`Valoración ${estadoActual ? 'visible' : 'oculta'} correctamente.`);
                
                setValoraciones(valoraciones.map(val => 
                    val.id_valoracion === id_valoracion 
                        ? { ...val, oculto: !estadoActual } 
                        : val
                ));
            }
        } catch (error: any) {
            console.error('Error: ', error);
            setError(error.response?.data?.message || `No se ha podido cambiar la visibilidad de la valoración.`);
        }
    }

    // LÓGICA DEL BUSCADOR
    const valoracionesFiltradas = valoraciones.filter((val) => {
        const busqueda = terminoBusqueda.toLowerCase();
        return (
            (val.comentario || '').toLowerCase().includes(busqueda) ||
            (val.autor_username || '').toLowerCase().includes(busqueda) ||
            (val.destinatario_username || '').toLowerCase().includes(busqueda) ||
            val.id_estancia.toString().includes(busqueda) ||
            (val.oculto ? 'oculta' : 'pública').includes(busqueda) // Permite buscar escribiendo "oculta"
        );
    });

    if (isLoading) return <div className="text-gray-600 text-xl">Cargando valoraciones...</div>;

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
                    <h2 className="text-2xl font-bold text-gray-800">Moderación de Valoraciones</h2>
                    <span className="bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                        {terminoBusqueda ? `${valoracionesFiltradas.length} / ${valoraciones.length}` : `Total: ${valoraciones.length}`}
                    </span>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Buscar autor, texto, id de estancia..."
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                            className="w-full pl-3 pr-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-gray-600 font-bold whitespace-nowrap">ID</th>
                            <th className="px-6 py-4 text-gray-600 font-bold">Reseña</th>
                            <th className="px-6 py-4 text-gray-600 font-bold whitespace-nowrap">Autor / Destinatario</th>
                            <th className="px-6 py-4 text-gray-600 font-bold whitespace-nowrap">Estado</th>
                            <th className="px-6 py-4 text-gray-600 font-bold text-center whitespace-nowrap">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {valoracionesFiltradas.length > 0 ? (
                            valoracionesFiltradas.map((val) => (
                                <tr key={val.id_valoracion} className={`border-b border-gray-100 transition-colors ${val.oculto ? 'bg-gray-100 opacity-75' : 'hover:bg-gray-50'}`}>
                                    <td className="px-6 py-4 font-semibold text-gray-700">#{val.id_valoracion}</td>
                                    
                                    <td className="px-6 py-4 text-gray-800 min-w-[300px]">
                                        <p className="italic text-gray-600 line-clamp-2" title={val.comentario}>
                                            "{val.comentario || 'Sin comentario de texto'}"
                                        </p>
                                        <div className="text-xs text-gray-400 mt-1">Estancia: #{val.id_estancia}</div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                                        <div className="mb-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase">De: </span> 
                                            <span className="font-semibold">@{val.autor_username}</span> 
                                            <span className="text-xs ml-1 text-gray-400">({val.autor_rol})</span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-gray-500 uppercase">A: </span> 
                                            <span className="font-semibold">@{val.destinatario_username}</span>
                                            <span className="text-xs ml-1 text-gray-400">({val.destinatario_rol})</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${val.oculto ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                                        >
                                            {val.oculto ? 'Oculta' : 'Pública'}
                                        </span>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <button 
                                            onClick={() => alternarVisibilidad(val.id_valoracion, val.oculto)}
                                            className={`font-semibold px-3 py-1 border rounded transition-colors cursor-pointer 
                                                ${val.oculto 
                                                    ? 'text-green-600 border-green-600 hover:bg-green-50' 
                                                    : 'text-orange-500 border-orange-500 hover:bg-orange-50'
                                                }`}
                                        >
                                            {val.oculto ? 'Mostrar' : 'Ocultar'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No se encontraron valoraciones que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};