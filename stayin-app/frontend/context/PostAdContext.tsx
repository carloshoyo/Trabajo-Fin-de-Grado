import React, { createContext, useState, useContext, ReactNode } from 'react';

interface PostAd {
    title: string;
    direccion?: string;
    numero?: string;
    puerta?: string;
    cp?: string;
    descripcion?: string;
    portada?: string;
    precio?: number;
    area?: number;
    max_inquilinos?: number;
    multimedia?: {
        salon: string[];
        cocina: string[];
        dormitorio: string[];
        bano: string[];
        extras?: {
            nombre: string;
            urls: string[];
        }[];
    };
    userName?: string;
}

const PostAdContext = createContext<any>(null);

export function PostAdProvider({children}: {children: ReactNode}) {
    const [adData, setAdData] = useState<PostAd>({
        title: '',
    })

    const updateData = (newData: Partial<PostAd>) => {
        setAdData((prev) => ({...prev, ...newData}));
    };

    return (
        <PostAdContext.Provider value={{ adData, updateData }}>
            {children}
        </PostAdContext.Provider>
    );
};

export const useAd = () => useContext(PostAdContext);