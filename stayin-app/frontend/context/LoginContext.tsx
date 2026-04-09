import React, { createContext, useState, useContext, ReactNode } from 'react';

interface LoginData {
    userName: string;
    password?: string    
}

const LoginContext = createContext<any>(null);

export function LoginProvider({children}: {children: ReactNode}) {
    const [loginData, setLoginData] = useState<LoginData>({
        userName: '',
    })

    const updateData = (newData: Partial<LoginData>) => {
        setLoginData((prev) => ({...prev, ...newData}));
    };

    return (
        <LoginContext.Provider value={{ loginData, updateData }}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLogin = () => useContext(LoginContext);