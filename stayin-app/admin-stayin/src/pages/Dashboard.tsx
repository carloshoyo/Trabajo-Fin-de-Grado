import { useState, useEffect } from 'react';
import { adminApi } from '../api/axios';

interface Stats {
    usuarios: number;
    anuncios: number;
    inquilinos: number;
    caseros: number;
}

export const Dashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await adminApi.get('/admin/estadisticas');
                if (response.data.success) {
                    setStats(response.data.stats);
                }
            } catch (err: any) {
                setError('Error al cargar las estadísticas.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) return <div className="text-gray-600 text-xl">Cargando panel...</div>;
    if (error) return <div className="text-red-500 text-xl">{error}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
            <p className="text-gray-500">Resumen del estado actual de la plataforma StayIn.</p>

            {/* Cuadrícula de Tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Usuarios</h3>
                    <div className="mt-2 text-3xl font-black text-gray-800">{stats?.usuarios}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Anuncios</h3>
                    <div className="mt-2 text-3xl font-black text-gray-800">{stats?.anuncios}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Inquilinos</h3>
                    <div className="mt-2 text-3xl font-black text-gray-800">{stats?.inquilinos}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Caseros</h3>
                    <div className="mt-2 text-3xl font-black text-gray-800">{stats?.caseros}</div>
                </div>

            </div>
        </div>
    );
};