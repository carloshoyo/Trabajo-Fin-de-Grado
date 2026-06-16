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
import { obtenerRecomendacionesAnuncios, obtenerRecomendacionesCompaneros, registrarInteraccion, Companero } from "@/api/apiRecomendar"
import { FlatList } from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { PopUp } from "@/components/my-components/popUp";

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
    const [companeros, setCompaneros] = useState<Companero[]>([]);
    const [valoracionesPendientes, setValoracionesPendientes] = useState([]);
    const { loginData, logout } = useLogin();
    const [ isLoadingAnuncios, setIsLoadingAnuncios ] = useState(false);
    const [ isLoadingCompaneros, setIsLoadingCompaneros ] = useState(false);
    const [verMasAnuncios, setVerMasAnuncios] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const [perfilUsuario, setPerfilUsuario] = useState(true);
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
                        setPerfilUsuario(resultado.perfil_completado)
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
            const cargarAnuncios = async () => {
                setIsLoadingAnuncios(true)
                setIsLoadingCompaneros(true)
                setError(null)                
                try {
                    const strIdUsuario = await SecureStore.getItemAsync('userId');
                    if (!strIdUsuario) {
                        throw new Error("No se encontró el ID del usuario en el dispositivo");
                    }

                    const idUsuario = parseInt(strIdUsuario, 10)
                    const datosAnuncios = await obtenerRecomendacionesAnuncios(idUsuario)
                    
                    const anunciosFormateados = datosAnuncios.map((item) => {
                        return {
                            ...item.vivienda_data,
                            score_afinidad: item.score_afinidad
                        };
                    });

                    if(anunciosFormateados.length > 0) {
                        setAnuncios(anunciosFormateados);
                    }

                } catch(error) {
                    setError("No se pudieron cargar las recomendaciones");
                    console.error("Error: ", error);
                    console.log("Cargando anuncios de forma tradicional.");
                } finally {
                    setIsLoadingAnuncios(false)
                }
            };

            const cargarCompaneros = async () => {
                setIsLoadingCompaneros(true);
                try {
                    // Obtenemos el ID guardado en SecureStore
                    const strIdUsuario = await SecureStore.getItemAsync('userId');
                    if (!strIdUsuario) return;

                    const idUsuario = parseInt(strIdUsuario, 10)

                    const datosCompaneros = await obtenerRecomendacionesCompaneros(idUsuario)

                    setCompaneros(datosCompaneros)
                    
                } catch(error) {
                    console.error("Error cargando compañeros recomendados: ", error);
                } finally {
                    setIsLoadingCompaneros(false);
                }
            };

            const inicializarPantalla = async () => {
                await getAnuncios();

                cargarAnuncios();
                cargarCompaneros();
            };

            inicializarPantalla();

    }, []));
    return (
        <View style={[styles.container, {
            backgroundColor: currentColors.background
        }]}>
            <FlatList
                contentContainerStyle={[styles.scrollContent, {
                    backgroundColor: currentColors.background
                }]}
                data={verMasAnuncios ? anuncios : anuncios.slice(0, 1)}
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
                            marginTop: 70,
                            alignSelf: 'center'
                        }]}>
                            Recomendados para ti
                        </Text>
                        {isLoadingAnuncios ? (
                        <ActivityIndicator/>
                        ) : (
                            <></>
                        )}
                    </View>
                }
                ListFooterComponent={
                    <View style={[styles.footerContainer]}>
                        {/* <Text style={[styles.title, {
                            color: currentColors.formTextColor,
                            alignSelf: 'center'
                        }]}>
                            Usuarios
                        </Text> */}
                        <Pressable 
                            onPress={() => setVerMasAnuncios(!verMasAnuncios)}
                            style={[styles.verMasPressAnuncios]}
                        >
                            {!verMasAnuncios ? (
                                <View style={{alignItems: 'center', gap: 5}}>
                                    <Text style={[ {
                                        color: currentColors.flatCardBorderColor,
                                        // textDecorationLine: 'underline'
                                    }]}>
                                        Ver más
                                    </Text>
                                    <SimpleLineIcons name="arrow-down" size={12} color={currentColors.flatCardBorderColor} />
                                </View>
                            ) : (
                                <View style={{alignItems: 'center', gap: 5}}>
                                    <SimpleLineIcons name="arrow-up" size={12} color={currentColors.flatCardBorderColor} />
                                    <Text style={[ {
                                        color: currentColors.flatCardBorderColor,
                                        // textDecorationLine: 'underline'
                                    }]}>
                                        Ver menos
                                    </Text>
                                </View>
                            )}
                                                        
                        </Pressable>
                        { isLoadingCompaneros ? (
                            <ActivityIndicator />
                        ) : (
                            <ScrollView
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={[styles.carrusel]}
                            >
                                {companeros.slice(0, 3).map((comp) => (
                                    <UserCard
                                        key={comp.id_inquilino}
                                        name={comp.nombre}
                                        scoring={comp.score_afinidad}

                                    />
                                ))}
                                {companeros.length === 0 && (
                                    <Text style={{ color: currentColors.flatCardBorderColor, padding: 20 }}>
                                        No hay compañeros compatibles con tu zona aún
                                    </Text>
                                )}
                                <UserCard name="Carlos Hoyo" scoring={89}></UserCard>
                                <UserCard name="Carlos Hoyo" scoring={69}></UserCard>
                                <UserCard name="Carlos Hoyo" scoring={49}></UserCard>
                            </ScrollView>
                        )}                        
                        <Pressable style={[styles.verMasPressCompaneros]}>
                            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                                <Text style={[{
                                    color: currentColors.flatCardBorderColor,
                                    // textDecorationLine: 'underline'
                                }]}>
                                    Ver todos
                                </Text>
                                <SimpleLineIcons name="arrow-right" size={12} color={currentColors.flatCardBorderColor} />
                            </View>
                        </Pressable>
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
                solicitudes={0}
            />
            {perfilUsuario ? (
                <PopUp
                    title="¡Completa tu perfil!"
                    text="Ayúdanos a conocer tus preferencias"
                />
            ) : (
                <></>
            )}
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
    head: {
        fontSize: 28,
        fontWeight: '600'
    },
    title: {
        fontSize: 24,
        fontWeight: '600'
    },
    container: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    carrusel: {
        gap: 15,
        alignItems: 'center'
    },
    logout: {
        width: '100%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center'
    },
    footerContainer: {
        gap: 20
    },
    verMasPressAnuncios: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20
    },
    verMasPressCompaneros: {
        width: '100%',
        alignItems: 'flex-end',
        paddingHorizontal: 20
    }
})