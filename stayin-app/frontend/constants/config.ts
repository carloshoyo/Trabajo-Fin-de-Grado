export const API_CONFIG = {
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    endpoints: {
        login: '/api/login',
        homeCasero: '/api/home/casero',
        register: '/api/register',
        postAd: '/api/postad',
        editAd: '/api/editad'
    }
};