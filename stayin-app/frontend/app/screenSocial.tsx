import { Colors } from "@/constants/theme";
import { View, StyleSheet, Text, useColorScheme, Pressable, ScrollView, ImageSourcePropType, PlatformColor } from "react-native";
import { SolicitudRegistroVivienda } from "@/components/my-components/solicitudRegistroVivienda";
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from "@/constants/config";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { NavBar } from "@/components/my-components/navBar";
import { RatingCard } from "@/components/my-components/ratingCard";

interface Solicitud {
    id_solicitud: number,
    id_anuncio: number,
    img: ImageSourcePropType,
    username: string,
    titulo_anuncio: string
}

interface Valoracion {
    img_perfil: ImageSourcePropType,
    id_valoracion: number,
    usuario_a_valorar: string,
    id_valorado: number,
    id_estancia: number,
    titulo_anuncio: string
}

export default function ScreenSocial() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
    const getNotificaciones = async () => {
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
            if(resultado.success == true) {
                setSolicitudes(resultado.solicitudes);
                setValoraciones(resultado.valoraciones);
            } else {
                console.warn('El servidor ha rechazado la petición: ', resultado.message);
            }
        } catch(error) {
            console.error('Error: ', error);
        }
    };

    const quitarSolicitudDeLaPantalla = (id_solicitud_a_borrar: number) => {
        setSolicitudes(solicitudesActuales => 
            solicitudesActuales.filter(solicitud => solicitud.id_solicitud !== id_solicitud_a_borrar)
        );
    };

    useFocusEffect(
            useCallback(() => {
                getNotificaciones();
        }, []));
    return(
        <View style={{flex: 1}}>
            <ScrollView 
                style={[styles.scrollArea, {
                    backgroundColor: currentColors.background
                }]}
                contentContainerStyle={[styles.scrollContainer]}
            >
                <Text style={[styles.title, {
                    color: currentColors.formTextColor
                }]}>
                    Solicitudes pendientes
                </Text>
                <View style={[styles.solicitudes]}>
                    {solicitudes.length > 0 ? (
                        solicitudes.map((solicitud, index) => (
                            <SolicitudRegistroVivienda 
                                key={index}
                                username={solicitud.username}
                                title={solicitud.titulo_anuncio}
                                img={solicitud.img}
                                id_anuncio={solicitud.id_anuncio}
                                onActionComplete={() => quitarSolicitudDeLaPantalla(solicitud.id_solicitud)} 
                            />
                        ))
                    ) : (
                        <Text style={{color: currentColors.placeholderColor, textAlign: 'center'}}>
                            No hay solicitudes pendientes
                        </Text>
                    )}
                    
                </View>
                <Text style={[styles.title, {
                    color: currentColors.formTextColor
                }]}>
                    Valoraciones pendientes
                </Text>
                <View style={[styles.solicitudes]}>
                    {valoraciones.length > 0 ? (
                        valoraciones.map((valoracion, index) => (
                            <RatingCard
                                key={index}
                                usuario_a_valorar={valoracion.usuario_a_valorar}
                                title={valoracion.titulo_anuncio}
                                img={valoracion.img_perfil}
                                id_estancia={valoracion.id_estancia}
                                id_valorado={valoracion.id_valorado}
                            />
                        ))
                    ) : (
                        <Text style={{color: currentColors.placeholderColor, textAlign: 'center'}}>
                            No hay valoraciones pendientes
                        </Text>
                    )}
                    
                </View>
            </ScrollView>
            <NavBar active={"social"} solicitudes={solicitudes.length} valoraciones={valoraciones.length} />
        </View>
    )
};

const styles = StyleSheet.create({
    scrollArea: {
        flex: 1
    },
    scrollContainer: {
        padding: 10,
        paddingTop: 80,
        gap: 50,
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: '400'
    },
    solicitudes: {
        gap:20,
        width: '100%',
    }

})