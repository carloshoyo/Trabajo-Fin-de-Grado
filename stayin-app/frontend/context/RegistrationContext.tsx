import React, { createContext, useState, useContext, ReactNode } from 'react';

interface RegistrationData {
    name: string;
    apellidos?: string;
    email?: string;
    username?: string;
    date?: string;
    gender?: string;
    password?: string;
    rol?: string;
}

const RegistrationContext = createContext<any>(null);

export function RegistrationProvider({children}: {children: ReactNode}) {
    const [registrationData, setRegistrationData] = useState<RegistrationData>({
        name: '',
    })

    const updateData = (newData: Partial<RegistrationData>) => {
        setRegistrationData((prev) => ({...prev, ...newData}));
    };

    return (
        <RegistrationContext.Provider value={{ registrationData, updateData }}>
            {children}
        </RegistrationContext.Provider>
    );
};

export const useRegistration = () => useContext(RegistrationContext);