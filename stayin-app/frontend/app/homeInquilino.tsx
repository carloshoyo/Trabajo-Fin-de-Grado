import { Text, View, useColorScheme, StyleSheet, ScrollView, Pressable } from "react-native";
import { FlatCard } from "@/components/my-components/flatCard";
import { Colors } from "@/constants/theme";
import { NavBar } from "@/components/my-components/navBar";
import { UserCard } from "@/components/my-components/userCard";
import { useCallback, useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from "@/constants/config";
import { useLogin } from "@/context/LoginContext";
import { useFocusEffect } from "expo-router";

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

export default function HomeInquilino() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
    const { loginData, logout } = useLogin();
    const getAnuncios = async () => {
        try {
                    const token = await SecureStore.getItemAsync('userToken');
                    const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.homeInquilino}`, {
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

    useFocusEffect(
        useCallback(() => {
            getAnuncios();
    }, []));
    return (
        <View style={[styles.container, {
            backgroundColor: currentColors.background
        }]}>
            <ScrollView
                style={[styles.scrollArea]}
                contentContainerStyle={[styles.scrollContent, {
                    backgroundColor: currentColors.background
                }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.title, {
                    color: currentColors.formTextColor,
                    marginTop: 70
                }]}>
                    Viviendas que te podrían interesar
                </Text>
                {anuncios.map((anuncio, index) => (
                    <FlatCard 
                    key={index}
                    title={anuncio.titulo}
                    img={require('../assets/images/flat_img.png')}
                    direccion={anuncio.direccion}
                    precio={anuncio.precio}
                    descripcion={anuncio.descripcion}
                    area={anuncio.area}
                    max_inquilinos={anuncio.max_inquilinos}
                    id_anuncio={anuncio.id_anuncio}
                />                    
                ))}
                <Text style={[styles.title, {
                    color: currentColors.formTextColor
                }]}>
                    Posibles futuros compañeros
                </Text>
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[styles.carrusel]}
                >
                    <UserCard name="Carlos Hoyo" descripcion="Granada"></UserCard>
                    <UserCard name="Carlos Hoyo" descripcion="Granada"></UserCard>
                    <UserCard name="Carlos Hoyo" descripcion="Granada"></UserCard>
                </ScrollView>
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
            <NavBar active="home" solicitudes={16}></NavBar>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        display: 'flex',
        flex: 1,
        padding: 10,
        gap: 20,
        position: 'relative'
    },
    scrollArea: {
        flex: 1
    },
    scrollContent: {
        padding: 10,
        gap: 20,
        position: 'relative',
        paddingBottom: 120
    },
    title: {
        fontSize: 24,
        fontWeight: '400'
    },
    container: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    carrusel: {
        gap: 15
    },
    logout: {
        width: '100%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center'
    }
})