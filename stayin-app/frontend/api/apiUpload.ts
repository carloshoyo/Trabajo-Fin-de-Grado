import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '@/constants/config';

// Sube una lista de imágenes locales (uri file://) al backend y devuelve sus URLs http.
export const subirImagenes = async (uris: string[]): Promise<string[]> => {
    if (!uris || uris.length === 0) return [];

    // "Remota" = ya está en el servidor (ruta relativa /uploads o URL http antigua); no hay que volver a subirla
    const esRemota = (u: string) => typeof u === 'string' && (u.startsWith('/uploads') || u.startsWith('http'));
    const yaSubidas = uris.filter(esRemota);
    const locales = uris.filter(u => !esRemota(u));

    if (locales.length === 0) return yaSubidas;

    const token = await SecureStore.getItemAsync('userToken');
    const formData = new FormData();

    locales.forEach((uri, i) => {
        const nombre = uri.split('/').pop() || `foto_${i}.jpg`;
        const ext = (nombre.split('.').pop() || 'jpg').toLowerCase();
        const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        formData.append('fotos', { uri, name: nombre, type } as any);
    });

    const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.uploadImages}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    const resultado = await respuesta.json();
    if (!resultado.success) {
        throw new Error(resultado.message || 'No se pudieron subir las imágenes');
    }

    return [...yaSubidas, ...resultado.urls];
};

// Sube todas las fotos de un objeto multimedia ({salon:[], cocina:[], ...}) y
// devuelve el mismo objeto con las uri reemplazadas por URLs http.
export const subirMultimedia = async (multimedia: any): Promise<any> => {
    const origen = multimedia || {};
    const salida: any = {};

    for (const sala of Object.keys(origen)) {
        if (Array.isArray(origen[sala])) {
            salida[sala] = await subirImagenes(origen[sala]);
        } else {
            salida[sala] = origen[sala];
        }
    }

    return salida;
};
