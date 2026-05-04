import { Text, View, StyleSheet, useColorScheme, ImageSourcePropType, ScrollView, Pressable } from 'react-native';
import { Colors } from '@/constants/theme';
import { AdvertCard } from '@/components/my-components/advertCard'; 
import { PostAdComponent } from '@/components/my-components/postAdComponent';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { FlatCard } from '@/components/my-components/flatCard';
import { useLogin } from '@/context/LoginContext';
import { API_CONFIG } from '@/constants/config';
import * as SecureStore from 'expo-secure-store';
import { NavBar } from '@/components/my-components/navBar';

interface Anuncio {
    titulo: string;
    img: string;
    direccion: string;
    precio: number;
    descripcion: string;
    area: number;
    max_inquilinos: number;
    id_anuncio: number;
}

export default function HomeCasero({userName}: {userName: string}) {
    const { loginData, logout } = useLogin();
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const getAnuncios = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.homeCasero}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userName: loginData.userName
                }),
            });
            const resultado = await respuesta.json();
            if(resultado.success == true) {
                setAnuncios(resultado.adData);
            } else {
                // Si el Portero rechaza (o hay cualquier otro error lógico)
                console.warn("Petición rechazada por el servidor:", resultado.message);
                
                // Aquí puedes añadir lógica de negocio, por ejemplo:
                // Si el mensaje es de token caducado, puedes forzar un logout automático
                if (resultado.message === 'Token inválido o caducado.' || resultado.message === 'Acceso denegado. No hay token.') {
                    logout(); // Expulsa al usuario por seguridad
                }
            }
        } catch(error) {
            console.error('Error:', error);
            return false;
        }
    };

    const getSolicitudes = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.cargarSolicitudes}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },            
            });
            const resultado = await respuesta.json();
            if(resultado.sucess == true) {
                setSolicitudes(resultado.solicitudes);
            } else {
                console.warn('El servidor ha rechazado la petición: ', resultado.message);
            }
        } catch(error) {
            console.error('Error al cargar las solicitudes: ', error);
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
                        descripcion={anuncio.descripcion}
                        area={anuncio.area}
                        max_inquilinos={anuncio.max_inquilinos}
                        id_anuncio={anuncio.id_anuncio}
                    />
                ))}
                <PostAdComponent/>
                <Pressable 
                    style={[styles.logout, {
                        backgroundColor: currentColors.postAdContainerColor
                    }]}
                    onPress={logout}
                >
                    <Text style={{color: currentColors.formTextColor}}>
                        Log Out
                    </Text>
                </Pressable>
            </ScrollView>
            <NavBar active='home' solicitudes={1}/>            
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
        marginTop: 60,
        paddingBottom: 120
    },
    title: {
        fontSize: 24,
        fontWeight: '400'
    },
    logout: {
        width: '100%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center'
    }
})