import { Text, TextInput, View, StyleSheet, useColorScheme, ScrollView, Pressable, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/theme";
import Entypo from '@expo/vector-icons/Entypo';
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { router } from "expo-router";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function PostAd() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const [media, setMedia] = useState<string[]>([]);
    const handleContinuar = () => {
        router.push('/postAdImages');
    }
    const seleccionarMultimedia = async () => {
        let resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos', 'livePhotos'],
            allowsMultipleSelection: true,
            quality: 0.7
        })

        if (!resultado.canceled) {
            // Guardamos las rutas de los archivos seleccionados
            const uris = resultado.assets.map(asset => asset.uri);
            setMedia([...media, ...uris]);
        }
    };
    const handleClose = () => {
        router.back();
    }
    return (
        <View style={[styles.main, {
            backgroundColor: currentColors.background
        }]}>
            <ScrollView style={[styles.scrollArea]}
                contentContainerStyle={[styles.scrollContent, {
                    backgroundColor: currentColors.postAdContainerColor
                }]}
            >
                <Text style={[styles.title, {
                    color: currentColors.postAdClose
                }]}>
                    Datos del anuncio
                </Text>
                <Pressable 
                    style={[styles.containerClose]}
                    onPress={handleClose}
                >
                    <EvilIcons name="close-o" size={42} color={currentColors.postAdClose} />
                </Pressable>
                <TextInput
                    placeholder="Título"
                    style={[styles.input, {
                        backgroundColor: currentColors.postAdInput,
                        borderColor: currentColors.postAdBorderColor
                    }]}
                    placeholderTextColor={currentColors.postAdInputTextColor}
                >
                </TextInput>
                <TextInput
                    placeholder="Dirección"
                    style={[styles.input, {
                        backgroundColor: currentColors.postAdInput,
                        borderColor: currentColors.postAdBorderColor
                    }]}
                    placeholderTextColor={currentColors.postAdInputTextColor}
                >
                </TextInput>
                <View style={[styles.infoContainer]}>
                    <TextInput
                        placeholder="Nº"
                        style={[styles.inputCP, {
                            backgroundColor: currentColors.postAdInput,
                            borderColor: currentColors.postAdBorderColor
                        }]}
                        placeholderTextColor={currentColors.postAdInputTextColor}
                        keyboardType="numeric"
                    >
                    </TextInput>
                        <TextInput
                        placeholder="Puerta"
                        style={[styles.inputCP, {
                            backgroundColor: currentColors.postAdInput,
                            borderColor: currentColors.postAdBorderColor
                        }]}
                        placeholderTextColor={currentColors.postAdInputTextColor}
                        keyboardType="numeric"
                    >
                    </TextInput>
                        <TextInput
                        placeholder="Código postal"
                        style={[styles.inputCP, {
                            backgroundColor: currentColors.postAdInput,
                            borderColor: currentColors.postAdBorderColor
                        }]}
                        placeholderTextColor={currentColors.postAdInputTextColor}
                        keyboardType="numeric"
                    >
                    </TextInput>
                </View>
                <TextInput
                    placeholder="Descripción"
                    style={[styles.input, styles.textArea, {
                        backgroundColor: currentColors.postAdInput,
                        borderColor: currentColors.postAdBorderColor
                    }]}
                    placeholderTextColor={currentColors.postAdInputTextColor}
                    multiline={true}
                    scrollEnabled={true}
                    numberOfLines={15}
                    textAlignVertical="top"
                >
                </TextInput>
                <Pressable
                    onPress={seleccionarMultimedia}
                >
                    <View style={[styles.attachDocs, {
                        backgroundColor: currentColors.postAdInput,
                        borderColor: currentColors.postAdBorderColor
                    }]}>
                        <Text style={{
                            color: currentColors.postAdBorderColor
                        }}>
                            Adjunta las imágenes y vídeos de la vivienda
                        </Text>
                        <View style={[styles.attachIcon]}>
                            <Entypo name="attachment" size={64} color={currentColors.postAdInputTextColor} />
                        </View>
                    </View>
                </Pressable>
                <Pressable 
                    style={[styles.continuar]}
                    onPress={handleContinuar}
                >
                    <FontAwesome6 name="circle-arrow-right" size={32} color={currentColors.postAdClose} />
                </Pressable>
                
            </ScrollView>
            
        </View>
    )
    
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        padding: 10,
        position: 'relative'
    },title: {
        fontSize: 24,
        fontWeight: '600'
    },
    containerClose: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 30,
        position: 'absolute',
        right: 15,
        top: 15
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        borderRadius: 30,
        alignItems: 'center',
        padding: 30,
        gap: 15
    },
    input: {
        width: '100%',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1.5
    },
    inputCP: {
        padding: 12,
        borderRadius: 10,
        borderWidth: 1.5
    },
    textArea: {
        minHeight: 150,
        justifyContent: 'flex-start'
    },
    attachDocs: {
        height: 200,
        borderRadius: 10,
        borderWidth: 1.5,
        padding: 12,
        width: '100%',
    },
    attachIcon: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    infoContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'

    },
    continuar: {
        width: '100%',
        alignItems: 'flex-end',
        borderRadius: 100,
        marginTop: 'auto',
    }
})