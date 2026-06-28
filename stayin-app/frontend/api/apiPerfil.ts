import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '@/constants/config';

export interface PerfilInquilino {
    nombre: string;
    apellidos: string;
    descripcion: string | null;
    fuma: boolean;
    mascota: boolean;
    estudiante: boolean;
    presupuesto_max: number | null;
    zona: string[] | null;
    ciudad: string | null;
    preferencias: any;
}

export const getPerfilInquilino = async (): Promise<PerfilInquilino> => {
    const token = await SecureStore.getItemAsync('userToken');

    const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.getPerfilInquilino}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const resultado = await respuesta.json();

    if (!resultado.success) {
        throw new Error(resultado.message || 'No se pudo cargar el perfil');
    }

    return resultado.perfil;
};

export const actualizarPerfilInquilino = async (payload: Partial<PerfilInquilino>): Promise<void> => {
    const token = await SecureStore.getItemAsync('userToken');

    const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.editProfile}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    const resultado = await respuesta.json();

    if (!resultado.success) {
        throw new Error(resultado.message || 'No se pudo guardar el perfil');
    }
};
