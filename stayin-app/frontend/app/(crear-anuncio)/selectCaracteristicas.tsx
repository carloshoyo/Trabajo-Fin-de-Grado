import { useAd } from "@/context/PostAdContext";
import { router } from "expo-router";
import { Text, TextInput, View, StyleSheet, useColorScheme, ScrollView, Pressable, TouchableOpacity } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from "@/constants/config";

export default function SelectCaractersticas() {
    const { updateData, adData } = useAd();
    const handleAtras = () => {
            router.back();
        };
        const handleContinuar = async () => {
            if(adData.multimedia && adData.multimedia['salon'] != undefined && adData.multimedia['cocina'] != undefined && adData.multimedia['dormitorio'] != undefined && adData.multimedia['bano'] != undefined) {
                if(await enviarDatos()) {
                    router.dismissTo('/homeCasero'); 
                }
            }
        };
    
        const enviarDatos = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.postAd}`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: adData.title,
                        direccion: adData.direccion,
                        numero: adData.numero,
                        puerta: adData.puerta,
                        cp: adData.cp,
                        descripcion: adData.descripcion,
                        portada: adData.portada,
                        precio: adData.precio,
                        multimedia: adData.multimedia,
                        userName: adData.userName,
                        area: adData.area,
                        max_inquilinos: adData.max_inquilinos
                    }),
                });
                const resultado = await respuesta.json();
                // console.log('CÓDIGO HTML RECIBIDO: ', resultado);
                // console.log('Respuesta: ', resultado);
                return true;
            } catch (error) {
                console.error('Error: ', error);
                return false;
            }
        }
    return (
        <View></View>
    )
}