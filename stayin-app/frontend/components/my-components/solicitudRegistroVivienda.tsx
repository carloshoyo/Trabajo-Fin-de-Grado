import { Colors } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { View, StyleSheet, Text, useColorScheme, Image, ImageSourcePropType, Pressable } from "react-native";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { API_CONFIG } from '@/constants/config';
import * as SecureStore from 'expo-secure-store';

export function SolicitudRegistroVivienda({img, username, title, id_anuncio, onActionComplete}: {img?: ImageSourcePropType, username: string, title: string, id_anuncio: number, onActionComplete: () => void}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const handlePres = async (accepts: boolean, id_anuncio: number) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.procesarSolicitud}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify ({
                    accepts: accepts,
                    userName: username,
                    id_anuncio: id_anuncio
                }),
            });
            const resultado = await respuesta.json();
            if(resultado.success == true) {
                console.log(accepts ? 'Petición aceptada correctamente' : 'Petición rechazada correctamente');
                onActionComplete();
            } else {
                console.warn(accepts ? 'No se ha podido aceptar la solicitud' : 'No se ha podido rechazar la solicitud');
            }
        } catch(error) {
            console.error('Error al procesar solicitud: ', error);
        }
    }
    return (
        <View style={[styles.main]}>
            <View style={[styles.solicitudCard, {
                    backgroundColor: currentColors.formTextArea
                }]}>
                <View style={[styles.userData]}> 
                    {img ? (
                        <Image
                            source={img}
                        />
                    ) : (
                        <FontAwesome5 name="user-circle" size={64} color={currentColors.formButtonColor}/>
                    )}
                    <View style={{alignItems: 'center'}}>
                        <Text style={[styles.username, {
                            color: currentColors.formButtonColor
                        }]}>
                            {username}
                        </Text>
                        <Text style={[styles.direccion, {
                            color: currentColors.formButtonColor
                        }]}>
                            {title}
                        </Text>
                    </View>
                </View>
                <View style={[styles.decision]}>
                    <Pressable onPress={() => handlePres(true, id_anuncio)}>
                        <EvilIcons name="check" size={48} color={currentColors.acceptRequest} />
                    </Pressable>
                    <Pressable onPress={() => handlePres(false, id_anuncio)}>
                        <EvilIcons name="close-o" size={48} color={currentColors.declineRequest} />
                    </Pressable>
                </View>
            </View>            
        </View>
    )
};

const styles = StyleSheet.create({
    main: {
        width: '100%'
    },
    solicitudCard: {
        flexDirection: 'row',
        borderRadius: 13,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    username: {
        fontSize: 18,
        fontWeight: '500'
    },
    direccion: {
        fontSize: 20,
        fontWeight: '600'
    },
    userData: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center',
    },
    decision: {
        flexDirection: 'row'
    }
})