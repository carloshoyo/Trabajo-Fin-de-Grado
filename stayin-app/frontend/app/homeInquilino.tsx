import { Text, View, useColorScheme, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { FlatCard } from "@/components/my-components/flatCard";
import { Colors } from "@/constants/theme";
import { NavBar } from "@/components/my-components/navBar";
import { UserCard } from "@/components/my-components/userCard";
import { useCallback, useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from "@/constants/config";
import { useLogin } from "@/context/LoginContext";
import { useFocusEffect } from "expo-router";
import { obtenerRecomendaciones, registrarInteraccion } from "@/api/apiRecomendar"
import { FlatList } from "react-native";

interface Anuncio {
    titulo: string;
    img: string;
    direccion: string;
    precio: number;
    descripcion: string;
    area: number;
    max_inquilinos: number;
    id_anuncio: number;
    score_afinidad?: number;
    es_favorito: boolean;
}

export default function HomeInquilino() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
    const [valoracionesPendientes, setValoracionesPendientes] = useState([]);
    const { loginData, logout } = useLogin();
    const [ isLoading, setIsLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
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
                        setValoracionesPendientes(resultado.valoraciones_pendientes);
                    } else {
                        console.warn("Petición rechazada por el servidor:", resultado.message);
                        
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
            const cargarRecomendaciones = async () => {
                setIsLoading(true)
                setError(null)                
                try {
                    const strIdUsuario = await SecureStore.getItemAsync('userId');
                    if (!strIdUsuario) {
                        throw new Error("No se encontró el ID del usuario en el dispositivo");
                    }

                    const idUsuario = parseInt(strIdUsuario, 10)
                    const datos = await obtenerRecomendaciones(idUsuario)

                    const anunciosFormateados = datos.map((item) => {
                        return {
                            ...item.vivienda_data,
                            score_afinidad: item.score_afinidad
                        };
                    });

                    setAnuncios(anunciosFormateados);
                } catch(error) {
                    setError("No se pudieron cargar las recomendaciones");
                    console.error("Error: ", error);
                    console.log("Cargando anuncios de forma tradicional.");
                    getAnuncios();
                } finally {
                    setIsLoading(false)
                }
            };

            if(anuncios) {
                cargarRecomendaciones();
            } else {
                getAnuncios();
            }

    }, []));
    return (
        <View style={[styles.container, {
            backgroundColor: currentColors.background
        }]}>
            <FlatList
                contentContainerStyle={[styles.scrollContent, {
                    backgroundColor: currentColors.background
                }]}
                data={anuncios}
                    keyExtractor={(item) => item.id_anuncio.toString()}
                    renderItem={( { item }) => (
                        <FlatCard 
                            title={item.titulo}
                            img={require('../assets/images/flat_img.png')}
                            direccion={item.direccion}
                            precio={item.precio}
                            descripcion={item.descripcion}
                            area={item.area}
                            max_inquilinos={item.max_inquilinos}
                            id_anuncio={item.id_anuncio}
                            es_favorito={item.es_favorito}
                        />
                    )}
                // style={[styles.scrollArea]}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View>
                        <Text style={[styles.title, {
                            color: currentColors.formTextColor,
                            marginTop: 70
                        }]}>
                            Viviendas que te podrían interesar
                        </Text>
                        {isLoading ? (
                        <ActivityIndicator/>
                        ) : (
                            <></>
                        )}
                    </View>
                }
                ListFooterComponent={
                    <View style={[styles.footerContainer]}>
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
                    </View>
                }
            >
                
            </FlatList>
            <NavBar 
                active="home"
                valoraciones={valoracionesPendientes.length}
                home={'/homeInquilino'}
            />
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
    },
    footerContainer: {
        gap: 20
    }
})