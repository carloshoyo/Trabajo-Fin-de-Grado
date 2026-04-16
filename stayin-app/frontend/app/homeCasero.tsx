import { Text, View, StyleSheet, useColorScheme, ImageSourcePropType, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';
import { AdvertCard } from '@/components/my-components/advertCard'; 
import { PostAdComponent } from '@/components/my-components/postAdComponent';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { FlatCard } from '@/components/my-components/flatCard';
import { useLogin } from '@/context/LoginContext';
import { API_CONFIG } from '@/constants/config';

interface Anuncio {
    titulo: string;
    img: string;
    direccion: string;
    precio: number;
}

export default function HomeCasero({userName}: {userName: string}) {
    const { loginData } = useLogin();
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
    const getAnuncios = async () => {
        try {
            const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.homeCasero}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userName: loginData.userName
                }),
            });
            const resultado = await respuesta.json();
            if(resultado.success == true) {
                setAnuncios(resultado.adData);
            }
        } catch(error) {
            console.error('Error:', error);
            return false;
        }
    }

    useFocusEffect(
        useCallback(() => {
            getAnuncios();
    }, []));
    return (
        <View style={{
            flex: 1,
            backgroundColor: currentColors.background
        } }>
            <ScrollView 
                style={[styles.scrollArea]}
                contentContainerStyle={[styles.scrollContainer, {
                    backgroundColor: currentColors.background
                }]}
            >
                <Text style={[styles.title, {color: currentColors.formTextColor}]}>
                    {anuncios.length != 0 ? 'Mis anuncios' : 'Publicar anuncio'}
                </Text>
                {anuncios.map((anuncio, index) => (
                    <AdvertCard
                        key={index}
                        title={anuncio.titulo}
                        img={anuncio.img}
                        direccion={anuncio.direccion}
                        precio={anuncio.precio}
                    />
                ))}
                <PostAdComponent/>
            </ScrollView>
            
        </View>
        
        
    )
}

const styles = StyleSheet.create({
    scrollArea: {
        flex: 1
    },
    scrollContainer: {
        alignItems: 'center',
        gap: 15,
        padding: 10,
        marginTop: 60
    },
    title: {
        fontSize: 24,
        fontWeight: '400'
    }
})