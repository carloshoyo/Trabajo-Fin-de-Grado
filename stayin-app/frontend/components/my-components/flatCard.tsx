import { View, StyleSheet, ImageSourcePropType, Text, useColorScheme, Pressable } from "react-native";
import { Image } from 'expo-image';
import { Colors } from "@/constants/theme";
import { router } from "expo-router";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from "@/constants/config";
import { useState } from "react";
import { resolverUri } from "@/components/my-components/carruselImagenes";

const PLACEHOLDER = require('../../assets/images/flat_img.png');

export function FlatCard({title, img, direccion, precio, descripcion, area, max_inquilinos, id_anuncio, es_favorito, multimedia}: {title: string, img: string, direccion: string, precio: number, descripcion: string, area: number, max_inquilinos: number, id_anuncio: number, es_favorito?: boolean, multimedia?: any}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const [isFavourite, setIsFavourite] = useState(es_favorito || false);
    const handleContinuar = () => {
        router.push({
            pathname: '/adViewInquilino',
            params: {title: title, img: img, direccion: direccion, precio: precio, descripcion: descripcion, area: area, max_inquilinos: max_inquilinos, id_anuncio: id_anuncio, multimedia: JSON.stringify(multimedia ?? {})}

        });
    }

    const handleInteraction = async (tipo: String, peso: number) => {
        const favoritoAnterior = isFavourite;
        setIsFavourite(!isFavourite);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const id_usuario = await SecureStore.getItemAsync('userId');
            const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.registrarInteraccion}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id_inquilino: id_usuario,
                    id_anuncio: id_anuncio,
                    tipo: tipo,
                    peso: peso
                })
            })
        } catch(error) {
            setIsFavourite(favoritoAnterior);
        }
    };

    const handleQuitarFav = async () => {
        const favoritoAnterior = isFavourite;
        setIsFavourite(!isFavourite);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const id_inquilino = await SecureStore.getItemAsync('userId');
            const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.eliminarFavoritos}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id_anuncio: id_anuncio
                })
            });
        } catch(error) {
            setIsFavourite(favoritoAnterior);
            console.error('Error: ', error);
        }
    }
    return (
        <Pressable 
            style={[styles.card, {
                backgroundColor: currentColors.flatCardBackground,
                borderColor: currentColors.flatCardBorderColor
            }]}
            onPress={handleContinuar}
        >
            <Image
                style={[styles.img]}
                source={typeof img === 'string' && img ? { uri: resolverUri(img) } : PLACEHOLDER}
                contentFit="cover"
            />
            <View style={[styles.flatInfo]}>
                <Text style={[styles.title, {
                    color: currentColors.formTextColor
                }]}>
                    {title}
                </Text>
                <Text style={[styles.direccion, {
                    color: currentColors.formTextColor
                }]}>
                    {direccion}
                </Text>
                <Text style={[styles.precio, {
                    color: currentColors.formTextColor
                }]}>
                    {precio}€/mes
                </Text>
                <View style={[styles.infoPiso]}>
                    <Text style={[styles.direccion, {
                        color: currentColors.formTextColor
                    }]}>
                        {area} m²
                    </Text>
                    <Text style={{
                        fontWeight: 'bold',
                        color: currentColors.formTextColor
                    }}>
                        {max_inquilinos} x <FontAwesome6 name="person" size={14} color={currentColors.formTextColor} />
                        {/* 4 x <Ionicons name="body-outline" size={14} color={currentColors.formTextColor} /> */}
                    </Text>
                </View>
                <View style={[styles.viewIcons]}>
                    <Pressable>
                        <Ionicons name="chatbox-outline" size={24} color={currentColors.formButtonColor}/>
                    </Pressable>
                    <Pressable onPress={!isFavourite ? () => handleInteraction('favoritos', 50) : () => handleQuitarFav()}>
                        <MaterialCommunityIcons name={isFavourite ? "cards-heart" : "cards-heart-outline"} size={24} color={isFavourite ? currentColors.notificationsColor : currentColors.formButtonColor}/>
                    </Pressable>
                </View>       
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 13,
        borderWidth: 3,
        width: '100%'
    },
    img: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 11,
        borderTopRightRadius: 11
    },
    flatInfo: {
        padding: 10,
        gap: 5
    },
    title: {
        fontSize: 24,
        fontWeight: '400'
    },
    direccion: {
        fontSize: 16
    },
    precio: {
        fontSize: 28,
        fontWeight: 'bold'
    },
    infoPiso: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center'
    },
    viewIcons: {
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10
    },
})