import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

interface LoginData {
    userName: string;
    password?: string;
    rol?: string;
}

const LoginContext = createContext<any>(null);

export function LoginProvider({children}: {children: ReactNode}) {
    const [loginData, setLoginData] = useState<LoginData>({
        userName: '',
        rol: '',
    })

    const updateData = (newData: Partial<LoginData>) => {
        setLoginData((prev) => ({...prev, ...newData}));
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userRole');
            await SecureStore.deleteItemAsync('userName');

            setLoginData({userName: '', rol: ''});

            router.replace('/');
        } catch(error) {
            console.error('Error al cerrar sesión: ', error);
        }
    };

    useEffect(() => {
        const comprobarSesion = async () => {
            try {
                const tokenGuardado = await SecureStore.getItemAsync('userToken');
                const rolGuardado = await SecureStore.getItemAsync('userRole');
                const userNameGuardado = await SecureStore.getItemAsync('userName');

                if(tokenGuardado && rolGuardado && userNameGuardado) {
                    updateData({
                        userName: userNameGuardado,
                        rol: rolGuardado
                    })                    ;

                    if(rolGuardado === 'Inquilino') {
                        router.replace('/homeInquilino');
                    } else if(rolGuardado === 'Casero') {
                        router.replace('/homeCasero');
                    }
                }
            } catch(error) {
                console.log('Error al leer el token: ', error);
            }
        };

        comprobarSesion();
    }, []);

    return (
        <LoginContext.Provider value={{ loginData, updateData, logout }}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLogin = () => useContext(LoginContext);