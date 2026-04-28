import { Colors } from "@/constants/theme";
import { Pressable, StyleSheet, useColorScheme, View, Image, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { router, useLocalSearchParams } from "expo-router";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useState } from "react";
import { useAd } from "@/context/PostAdContext";
import { API_CONFIG } from "@/constants/config";
import * as SecureStore from 'expo-secure-store';

export default function() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const { title } = useLocalSearchParams<{title: string}>();
    const { direccion } = useLocalSearchParams<{direccion: string}>();
    const { precio } = useLocalSearchParams<{precio: string}>();
    const { descripcion } = useLocalSearchParams<{descripcion: string}>();
    const { area } = useLocalSearchParams<{area: string}>();
    const { max_inquilinos } = useLocalSearchParams<{max_inquilinos: string}>();
    const { id_anuncio } = useLocalSearchParams<{id_anuncio: string}>();
    const [editedTitle , setEditedTitle] = useState(title);
    const [editedDireccion , setEditedDireccion] = useState(direccion);
    const [editedPrecio , setEditedPrecio] = useState(precio);
    const [editedDescripcion , setEditedDescripcion] = useState(descripcion);
    const [editedArea , setEditedArea] = useState(area);
    const [isEditable, setIsEditable] = useState(false);
    const [editedMaxInquilinos, setEditedMaxInquilinos] = useState(max_inquilinos);
    const { updateData, adData } = useAd();
    const handleClose = () => {
         router.back();
    };
    const handleEditar = () => {
        setIsEditable(!isEditable);
    };
    const handleDescartar = () => {
        setIsEditable(false);
    };
    const handleGuardar = async () => {
        if(editedTitle != '' && editedDireccion != '' && editedPrecio != '' && editedDescripcion != '' && editedArea != '' && editedMaxInquilinos != '') {
            if(await enviarDatos()) {
                router.dismissTo('/homeCasero'); 
            }
        }
    };
    const enviarDatos = async () => {
        try {
            console.log(adData);
            const token = await SecureStore.getItemAsync('userToken');
            const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.editAd}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: editedTitle,
                    direccion: editedDireccion,
                    descripcion: editedDescripcion,
                    precio: editedPrecio,
                    area: editedArea,
                    max_inquilinos: editedMaxInquilinos,
                    id_anuncio: id_anuncio
                }),
            });
            const resultado = await respuesta.json();
            // console.log('CÓDIGO HTML RECIBIDO: ', resultado);
            console.log('Respuesta: ', resultado);
            return true;
        } catch (error) {
            console.error('Error: ', error);
            return false;
        }
    }
    return (
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: currentColors.flatCardBackground }}
            behavior={Platform.OS == 'ios' ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
            <ScrollView 
                style={[styles.scrollArea]}
                contentContainerStyle={[styles.main, {
                    backgroundColor: currentColors.flatCardBackground,
                    borderColor: currentColors.flatCardBorderColor,
                    paddingBottom: 60
                }]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.containerClose]}>
                    {!isEditable ? (
                        <Pressable onPress={handleEditar}>
                            <View style={[styles.editButton, {backgroundColor: currentColors.formTextColor}]}>
                                <Text style={{color: currentColors.formTextArea}}>
                                    Editar                            
                                </Text>
                            </View>
                        </Pressable>
                    ) : (
                        <></>
                    )}
                    
                    <Pressable                     
                        onPress={handleClose}
                    >
                        <EvilIcons name="close-o" size={42} color={currentColors.postAdClose} />
                    </Pressable>
                </View>
                
                <View>
                    <Image
                        style={[styles.imgs]}
                        source={require('../assets/images/flat_img.png')}
                    />
                    <View style={[styles.containerInfo]}>
                        {isEditable ? (
                            <>
                                <TextInput
                                    style={[styles.input, styles.title, {
                                        color: currentColors.formTextColor,
                                        backgroundColor: currentColors.adViewInputColor,
                                        borderColor: currentColors.postAdBorderColor                                    
                                    }]}
                                    placeholder="Introduce un título para el anuncio"
                                    placeholderTextColor={currentColors.placeholderColor}
                                    value={editedTitle}
                                    onChangeText={setEditedTitle}
                                />
                                <TextInput
                                    style={[styles.input, styles.direccion, {
                                        color: currentColors.formTextColor,
                                        backgroundColor: currentColors.adViewInputColor,
                                        borderColor: currentColors.postAdBorderColor
                                    }]}
                                    placeholder="Introduce la dirección del inmueble"
                                    placeholderTextColor={currentColors.placeholderColor}
                                    value={editedDireccion}
                                    onChangeText={setEditedDireccion}
                                />
                                <View style={[styles.inputPrecio]}>
                                    <TextInput
                                        style={[styles.input, styles.precio, {
                                            color: currentColors.formTextColor,
                                            backgroundColor: currentColors.adViewInputColor,
                                            borderColor: currentColors.postAdBorderColor
                                        }]}
                                        placeholder="X"
                                        placeholderTextColor={currentColors.placeholderColor}
                                        value={editedPrecio}
                                        onChangeText={setEditedPrecio}
                                    />
                                    <Text style={[styles.precio, {
                                        color: currentColors.formTextColor
                                    }]}>
                                        €/mes
                                    </Text>
                                </View>
                                <View style={[styles.infoPiso]}>
                                    <View style={[styles.inputArea]}>
                                        <TextInput
                                            style={[styles.input, styles.direccion, {
                                                color: currentColors.formTextColor,
                                                backgroundColor: currentColors.adViewInputColor,
                                                borderColor: currentColors.postAdBorderColor
                                            }]}
                                            placeholder="X"
                                            placeholderTextColor={currentColors.placeholderColor}
                                            value={editedArea}
                                            onChangeText={setEditedArea}
                                        />
                                        <Text style={{color: currentColors.formTextColor}}>m²</Text>
                                    </View>
                                    <View style={[styles.inputArea]}>
                                        <TextInput
                                            style={[styles.input, styles.direccion, {
                                                color: currentColors.formTextColor,
                                                backgroundColor: currentColors.adViewInputColor,
                                                borderColor: currentColors.postAdBorderColor
                                            }]}
                                            placeholder="X"
                                            placeholderTextColor={currentColors.placeholderColor}
                                            value={editedMaxInquilinos}
                                            onChangeText={setEditedMaxInquilinos}
                                        />
                                        <Text style={{color: currentColors.formTextColor}}>
                                            x
                                        </Text>
                                        <FontAwesome6 name="person" size={14} color={currentColors.formTextColor} />                                    
                                    </View>
                                    
                                </View>
                                <Text style={[styles.descriptionTitle, {
                                    color: currentColors.formTextColor
                                }]}>
                                    Descripción
                                </Text>
                                <TextInput
                                    style={[styles.input, styles.descriptionInput, {
                                        color: currentColors.formTextColor,
                                        backgroundColor: currentColors.adViewInputColor,
                                        borderColor: currentColors.postAdBorderColor
                                    }]}
                                    value={editedDescripcion}
                                    onChangeText={setEditedDescripcion}
                                    placeholder="Introduce una descripción para el anuncio"
                                    placeholderTextColor={currentColors.placeholderColor}
                                    multiline={true}
                                    textAlignVertical="top"
                                />
                            </>
                        ) : (
                            <>
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
                                    {precio}€ / mes
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
                                <Text style={[styles.descriptionTitle, {
                                    color: currentColors.formTextColor
                                }]}>
                                    Descripción
                                </Text>
                                <Text style={{
                                    color: currentColors.formTextColor
                                }}>
                                    {descripcion}
                                </Text>
                                </>
                        )}
                        
                        
                        <Text style={[styles.descriptionTitle, {
                            color: currentColors.formTextColor
                        }]}>
                            Valoraciones
                        </Text>
                    </View>
                </View>
                {isEditable ? (
                    <View style={[styles.editConfirmButtonsContainer]}>
                        <Pressable 
                            style={[styles.editConfirmButtons, {
                                backgroundColor: currentColors.formButtonColor
                            }]}
                            onPress={handleDescartar}
                        >
                            <Text style={[styles.confirmButtonsText, {
                                color: currentColors.flatCardBackground
                            }]}>
                                Descartar
                            </Text>
                        </Pressable>
                        <Pressable 
                            style={[styles.editConfirmButtons, {
                                backgroundColor: currentColors.formButtonColor,
                            }]}
                            onPress={handleGuardar}
                        >
                            <Text style={[styles.confirmButtonsText, {
                                color: currentColors.flatCardBackground
                            }]}>
                                Guardar
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <></>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        position: 'relative',
        padding: 10,
        gap: 55,
    },
    containerClose: {
        flexDirection: 'row',
        position: 'absolute',
        right: 15,
        top: 15,
        zIndex: 1,
        alignItems: 'center',
        gap: 20
    },
    imgs: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
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
    containerInfo: {
        gap: 5,
        marginTop: 15
    },
    editButton: {
        padding: 5,
        borderRadius: 100
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: '500'
    },
    infoPiso: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center'
    },
    input: {
        padding: 3,
        borderRadius: 5,
        borderWidth: 1,
    },
    inputPrecio: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    editConfirmButtonsContainer: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
        marginTop: 'auto',
        marginBottom: 20,
        alignItems: 'center'
    },
    editConfirmButtons: {
        padding: 10,
        borderRadius: 8,
        minWidth: 120,
        justifyContent: 'center'
    },
    confirmButtonsText: {
        fontSize: 20,
        fontWeight: '500',
        textAlign: 'center'
    },
    scrollArea: {
        flex: 1,
    },
    descriptionInput: {
        minHeight: 100
    }
})