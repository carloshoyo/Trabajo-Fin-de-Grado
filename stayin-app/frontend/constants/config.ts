export const API_CONFIG = {
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    endpoints: {
        login: '/api/login',
        homeCasero: '/api/home/casero',
        register: '/api/register',
        postAd: '/api/postad',
        editAd: '/api/editad',
        homeInquilino: '/api/home/inquilino',
        registrarSolicitud: '/api/solicitudes/crear',
        cargarSolicitudes: '/api/solicitudes/casero',
        procesarSolicitud: '/api/solicitudes/procesar',
    }
};