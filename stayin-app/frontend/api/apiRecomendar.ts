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

export const obtenerRecomendaciones = async (idInquilino: number): Promise<ViviendaRecomenda[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 500);
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
            console.warn('El motor de recomendaciones tardó demasiado. Fallback activado.');
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