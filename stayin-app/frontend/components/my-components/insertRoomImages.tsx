import { Colors } from "@/constants/theme";
import { Pressable, View, Text, StyleSheet, useColorScheme } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import { useAd } from "@/context/PostAdContext";

export function InsertRoomImages({title, room}: {title: string, room: string}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const [media, setMedia] = useState<string[]>([]);
    const { updateData, adData } = useAd();
    const seleccionarMultimedia = async () => {
        let resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos', 'livePhotos'],
            allowsMultipleSelection: true,
            quality: 0.7
        })

        if (!resultado.canceled) {
            // Guardamos las rutas de los archivos seleccionados
            const nuevasUris = resultado.assets.map(asset => asset.uri);

            const multimediaActual = adData.multimedia || {
                salon: [],
                cocina: [],
                dormitorio: [],
                bano: [],
                extras: []
            };

            const fotosExistentes = multimediaActual[room as keyof typeof multimediaActual] || [];
            updateData({
                multimedia: {
                    ...multimediaActual,
                    [room]: [...fotosExistentes, ...nuevasUris]
                }                
            });
        }
    };
    return (
        <View style={[title==="" ? styles.mainNoTitle : styles.mainTitle, {
            borderColor: currentColors.postAdContinueColor,
            backgroundColor: currentColors.postAdInputTextColor
        }]}>
            <Pressable style={[styles.pressableArea]} onPress={seleccionarMultimedia}>
                <Text style={[styles.title, {
                    color: currentColors.postAdContinueColor
                }]}>
                    {title}
                </Text>
                <View style={[styles.masContainer, {
                    backgroundColor: currentColors.postAdContinueColor
                }]}>
                    <AntDesign name="plus" size={30} color={currentColors.postAdContainerColor} />
                </View>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    mainTitle: {
        width: '100%',
        height: 160,
        borderRadius: 13,
        borderWidth: 1.5
    },
    mainNoTitle: {
        width: '100%',
        height: 100,
        borderRadius: 13,
        borderWidth: 1.5
    },
    pressableArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    masContainer: {
        width: 60,
        height: 60,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center'
    },
    masText: {
        fontSize: 64,
        fontWeight: '100'
    },
    title: {
        position: 'absolute',
        top: 10,
        left: 15,
        fontSize: 24
    }    
})