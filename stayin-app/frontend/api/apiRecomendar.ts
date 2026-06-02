const API_URL = process.env.EXPO_PUBLIC_MOTOR_URL

interface Interaccion {
    id_inquilino: number;
    id_anuncio: number;
    tipo: string;
    peso: number;
}

interface ViviendaRecomenda {
    id_vivienda: number;
    score_afinidad: number;
    vivienda_data: any;
}

export interface Companero {
    id_inquilino: number;
    username: string;
    nombre: string;
    score_afinidad: number;
}

export const obtenerRecomendacionesAnuncios = async (idInquilino: number): Promise<ViviendaRecomenda[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const respuesta = await fetch(`${API_URL}/recomendar/anuncios`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id_inquilino: idInquilino
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!respuesta.ok) {
            console.warn('No se han recibido viviendas de la API')
            throw respuesta.statusText
        }
        const resultado = await respuesta.json()
        return resultado
    } catch(error: any) {
        clearTimeout(timeoutId);
        if(error === 'AbortError') {
            console.warn('El motor de recomendaciones de anuncios tardó demasiado. Fallback activado.');
        } else {
            console.error('Error: ', error);
        }
        throw error;
    }
}

export const obtenerRecomendacionesCompaneros = async(idInquilino: number): Promise<Companero[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const respuesta = await fetch(`${API_URL}/recomendar/companeros`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_inquilino: idInquilino
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!respuesta.ok) {
            console.warn('No se han recibido compañeros de la API')
            throw respuesta.statusText
        }
        const data = await respuesta.json();
        return data; // data ya es un array ordenado por score_afinidad
    } catch(error: any) {
        clearTimeout(timeoutId);
        if(error === 'AbortError') {
            console.warn('El motor de recomendaciones de comapñeros tardó demasiado. Fallback activado.');
        } else {
            console.error('Error: ', error);
        }
        throw error;
    }
}

export const registrarInteraccion = async(interaccion: Interaccion) => {
    try {
        const respuesta = await fetch(`${API_URL}/interaccion`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id_inquilino: interaccion.id_inquilino,
                id_anuncio: interaccion.id_anuncio,
                peso: interaccion.peso,
                tipo: interaccion.tipo
            })
        })
        if(!respuesta.ok) {
            throw respuesta.statusText
        }
    } catch(error){
        console.error('Error: ', error)
        throw error
    }
}