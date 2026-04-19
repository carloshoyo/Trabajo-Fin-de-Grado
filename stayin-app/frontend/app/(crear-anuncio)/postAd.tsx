import { Text, TextInput, View, StyleSheet, useColorScheme, ScrollView, Pressable, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/theme";
import Entypo from '@expo/vector-icons/Entypo';
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { router, useLocalSearchParams } from "expo-router";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useAd } from "@/context/PostAdContext";
import { useLogin } from "@/context/LoginContext";

export default function PostAd() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const { loginData } = useLogin()
    const [media, setMedia] = useState<string[]>([]);
    const [title, setTitle] = useState('');
    const [direccion, setDireccion] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [numero, setNumero] = useState('');
    const [puerta, setPuerta] = useState('');
    const [cp, setCp] = useState('');
    const [precio, setPrecio] = useState('');
    const [area, setArea] = useState('');
    const [inquilinos, setInquilinos] = useState('');
    const {updateData} = useAd();
    const handleContinuar = () => {
        if(title != '' && direccion != '' && descripcion != '' && cp != '' && numero != '') {
            if(puerta === '') {
                updateData({
                    title: title, 
                    direccion: direccion, 
                    descripcion: descripcion, 
                    cp: cp, 
                    numero: numero, 
                    userName: loginData.userName, 
                    portada: media[0], 
                    precio: Number(precio), 
                    area: Number(area), 
                    max_inquilinos: Number(inquilinos)
                });
            } else {
                updateData({
                    title: title, 
                    direccion: direccion, 
                    descripcion: descripcion,
                    cp: cp, numero: numero, 
                    puerta: puerta, 
                    userName: loginData.userName, 
                    portada: media[0], 
                    precio: Number(precio), 
                    area: Number(area), 
                    max_inquilinos: Number(inquilinos)
                });
            }
            router.push('/postAdImages');
        } else {
            console.log('Faltan datos del anuncio por introducir!!!');
        }
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
    };
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
                    value={title}
                    onChangeText={setTitle}
                >
                </TextInput>
                <TextInput
                    placeholder="Dirección"
                    style={[styles.input, {
                        backgroundColor: currentColors.postAdInput,
                        borderColor: currentColors.postAdBorderColor
                    }]}
                    placeholderTextColor={currentColors.postAdInputTextColor}
                    value={direccion}
                    onChangeText={setDireccion}
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
                        value={numero}
                        onChangeText={setNumero}
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
                        value={puerta}
                        onChangeText={setPuerta}
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
                        value={cp}
                        onChangeText={setCp}
                    >
                    </TextInput>
                </View>
                <View style={[styles.infoContainer]}>
                    <TextInput
                        placeholder="Area"
                        style={[styles.inputCP, {
                            backgroundColor: currentColors.postAdInput,
                            borderColor: currentColors.postAdBorderColor
                        }]}
                        placeholderTextColor={currentColors.postAdInputTextColor}
                        keyboardType="numeric"
                        value={area}
                        onChangeText={setArea}
                    >
                    </TextInput>
                        <TextInput
                        placeholder="Número de inquilinos"
                        style={[styles.inputCP, {
                            backgroundColor: currentColors.postAdInput,
                            borderColor: currentColors.postAdBorderColor
                        }]}
                        placeholderTextColor={currentColors.postAdInputTextColor}
                        keyboardType="numeric"
                        value={inquilinos}
                        onChangeText={setInquilinos}
                    >
                    </TextInput>
                    <TextInput
                        placeholder="Precio"
                        style={[styles.inputCP, {
                            backgroundColor: currentColors.postAdInput,
                            borderColor: currentColors.postAdBorderColor
                        }]}
                        placeholderTextColor={currentColors.postAdInputTextColor}
                        keyboardType="numeric"
                        value={precio}
                        onChangeText={setPrecio}
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
                    value={descripcion}
                    onChangeText={setDescripcion}
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