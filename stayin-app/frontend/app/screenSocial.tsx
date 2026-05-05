import { Colors } from "@/constants/theme";
import { View, StyleSheet, Text, useColorScheme, Pressable, ScrollView, ImageSourcePropType } from "react-native";
import { SolicitudRegistroVivienda } from "@/components/my-components/solicitudRegistroVivienda";
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from "@/constants/config";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { NavBar } from "@/components/my-components/navBar";

interface Solicitud {
    id_solicitud: number,
    id_anuncio: number,
    img: ImageSourcePropType,
    username: string,
    titulo_anuncio: string
}

export default function ScreenSocial() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
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
            if(resultado.success == true) {
                setSolicitudes(resultado.solicitudes);
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
                getSolicitudes();
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
                    {solicitudes.map((solicitud, index) => (
                        <SolicitudRegistroVivienda 
                            key={index}
                            username={solicitud.username}
                            title={solicitud.titulo_anuncio}
                            img={solicitud.img}
                            id_anuncio={solicitud.id_anuncio}
                            onActionComplete={() => quitarSolicitudDeLaPantalla(solicitud.id_solicitud)} 
                        />
                    ))}
                </View>
            </ScrollView>
            <NavBar active={"social"} solicitudes={0}/>
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