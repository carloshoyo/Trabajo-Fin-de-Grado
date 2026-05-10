import { Colors } from "@/constants/theme";
import { View, StyleSheet, Text, useColorScheme, Pressable, ImageSourcePropType, Image, ScrollView, Modal } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from "@/constants/config";
import { useCallback, useEffect, useState } from "react";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { CurvedTransition } from "react-native-reanimated";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { BlurView } from "expo-blur";

interface Cuestion {
    id_criterio: number;
    categoria: string;
    pregunta: string;
}

export default function RatingScreen() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const { usuario_a_valorar } = useLocalSearchParams<{usuario_a_valorar: string}>();
    const { title } = useLocalSearchParams<{title: string}>();
    const { id_valorado } = useLocalSearchParams<{id_valorado: string}>();
    const { id_estancia } = useLocalSearchParams<{id_estancia: string}>();
    const [cuestiones, setCuestiones] = useState<Cuestion[]>([]);
    const [calificaciones, setCalificaciones] = useState<{[key: number]: number}>({});
    const [faltanDatos, setFaltanDatos] = useState(false);
    const [datosEnviados, setDatosEnviados] = useState(false);
    const getCuestiones = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.valorarUsuario}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            const resultado = await respuesta.json();
            if(resultado.success == true) {
                setCuestiones(resultado.cuestiones);
            }
        } catch(error) {
            console.error('Error: ', error);
        }
    };

    useEffect(() => {
        getCuestiones();
    }, []);

    const handleCalificar = (id_criterio: number, calificacion: number) => {
        setCalificaciones(estadoAnterior => ({
            ...estadoAnterior,
            [id_criterio]: calificacion
        }))
    };

    const handleEnviar = async () => {
        if(Object.keys(calificaciones).length < 13) {
            setFaltanDatos(true);
            return false
        }
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.enviarCalificacionesUsuario}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify ({
                    calificaciones: calificaciones,
                    id_estancia: id_estancia,
                    id_valorado: id_valorado
                }),
            });
            const resultado = await respuesta.json();
            if(resultado.success == true) {
                console.log(resultado.message);
                setDatosEnviados(true);
            } else {
                console.warn('No se ha podido almacenar la solicitud correctamente');
            }
        } catch(error) {
            console.error('Error al procesar solicitud: ', error);
        }
    };

    const handleCloseWarning = () => {
        setFaltanDatos(false);
    };

    const handleCloseSuccess = () => {
        router.replace('/homeCasero');
    }

    return (
        <ScrollView 
            style={[styles.scrollArea, {backgroundColor: currentColors.background}]}
            contentContainerStyle={[styles.scrollContent, {
                backgroundColor: currentColors.background
            }]}
        >
            <View style={[styles.disclaimerContainer, {
                borderColor: currentColors.formTextArea
            }]}>
                <Text style={[styles.disclaimerText, {
                    color: currentColors.placeholderColor
                }]}>
                    Recuerde responder de la forma más sincera posible, esta valoración podría ayudar a otros usuarios
                </Text>
            </View>
            
            <View style={[styles.cuestionesContainer, {
                gap: 10
            }]}>
                {cuestiones.map((cuestion, index) => {
                    // Comprobamos si es el inicio de una nueva categoría
                    const esNuevaCategoria = index === 0 || cuestion.categoria !== cuestiones[index - 1].categoria;
                    
                    // Dividimos el texto para separar el título de la descripción
                    const [cabecera, descripcion] = cuestion.pregunta.split(':');

                    return (
                        <View key={cuestion.id_criterio || index} style={{ width: '100%' }}>
                            {esNuevaCategoria && (
                                <Text style={[styles.categoriaHeader, { color: currentColors.formTextColor }]}>
                                    {cuestion.categoria}
                                </Text>
                            )}
                            <View style={[styles.questionCard, { backgroundColor: currentColors.formTextArea }]}>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.questionHeader, { color: currentColors.formTextColor }]}>
                                        {cabecera}
                                    </Text>
                                    {descripcion && (
                                        <Text style={[styles.questionSubtext, { color: currentColors.placeholderColor }]}>
                                            {descripcion.trim()}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.starsPlaceholder}>
                                    {[1, 2, 3, 4, 5].map((valorEstrella) => {
                                        const estaRellena = calificaciones[cuestion.id_criterio] >= valorEstrella;

                                        return (
                                            <Pressable
                                                key={valorEstrella}
                                                onPress={() => handleCalificar(cuestion.id_criterio, valorEstrella)}
                                            >
                                                <FontAwesome 
                                                    name={estaRellena ? "star" : "star-o" }
                                                    size={24} 
                                                    color={estaRellena ? "#FFD700" : currentColors.placeholderColor} 
                                                />
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
                <View style={[styles.enviarButtonContainer, {
                    borderColor: currentColors.formTextArea
                }]}>
                    <Pressable 
                        style={[styles.enviarButton, {
                            backgroundColor: currentColors.formButtonColor,
                        }]}
                        onPress={handleEnviar}
                    >
                    <Text style={[styles.enviarText, {
                        color: currentColors.formTextArea
                    }]}>
                        Enviar
                    </Text>
                </Pressable>
            </View>
            <Modal
                visible={faltanDatos}
                transparent={true}
                animationType="fade"
            >
                <BlurView 
                    style={styles.blurView}
                    intensity={40}
                    tint={currentColors.blurStyle}
                >
                    <View style={[styles.warningContainer, {
                        backgroundColor: currentColors.formTextArea
                    }]}>
                        <Text style={{color: currentColors.placeholderColor}}>
                            Debes responder todas las cuestiones antes de enviar la valoración
                        </Text>
                        <Pressable style={[styles.closingIcon]} onPress={handleCloseWarning}>
                            <EvilIcons name="close-o" size={24} color={currentColors.placeholderColor} />
                        </Pressable>
                    </View>
                </BlurView>                    
            </Modal>
            <Modal
                visible={datosEnviados}
                transparent={true}
                animationType="fade"
            >
                <BlurView 
                    style={styles.blurView}
                    intensity={40}
                    tint={currentColors.blurStyle}
                >
                    <View style={[styles.warningContainer, {
                        backgroundColor: currentColors.formTextArea
                    }]}>
                        <FontAwesome5 name="check" size={24} color={currentColors.acceptRequest} />
                        <Text style={[styles.sucessHeader, {color: currentColors.formTextColor}]}>
                            Valoración enviada correctamente
                        </Text>
                        <View style={[styles.successMessageContainer]}>
                            
                            <Text style={{color: currentColors.placeholderColor, textAlign: 'center'}}>
                                ¡Muchas gracias por tu tiempo!
                            </Text>
                        </View>
                        <Pressable style={[styles.closingIcon]} onPress={handleCloseSuccess}>
                            <EvilIcons name="close-o" size={24} color={currentColors.placeholderColor} />
                        </Pressable>
                    </View>
                </BlurView>                    
            </Modal>
            
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '500'
    },
    disclaimerContainer: {
        width: '100%',
        paddingHorizontal: 20,
        borderBottomWidth: .5,
        paddingBottom: 30
    },
    disclaimerText: {
        fontSize: 12,
        fontWeight: '300'
    },
    categoria: {
        fontSize: 22,
        fontWeight: '500'
    },
    cuestion: {
        fontSize: 18,
        fontWeight: '400'
    },
    cuestiones: {
        gap: 20,
    },
    cuestionesContainer: {
        padding: 10,
        width: '100%'
    },
    categoriaHeader: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 30,
        marginBottom: 15,
        alignSelf: 'flex-start',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    questionCard: {
        width: '100%',
        padding: 16,
        borderRadius: 15,
        marginBottom: 12,
        // Sutil elevación para Android/iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    textContainer: {
        marginBottom: 12,
    },
    questionHeader: {
        fontSize: 17,
        fontWeight: '600',
        lineHeight: 22,
    },
    questionSubtext: {
        fontSize: 14,
        fontWeight: '400',
        marginTop: 4,
        lineHeight: 18,
    },
    starsPlaceholder: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10
    },
    enviarButtonContainer: {
        paddingTop: 40,
        marginTop: 20,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: .5
    },
    enviarButton: {
        padding: 10,
        borderRadius: 7,
        width: '35%',
        justifyContent: 'center',        
    },
    enviarText: {
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center'
    },
    blurView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    warningContainer: {
        width: '75%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 13,
        position: 'relative',
        padding: 30,
        gap: 10
    },
    closingIcon: {
        position: 'absolute',
        right: 5,
        top: 5
    },
    successMessageContainer: {
        flexDirection: 'column',
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    sucessHeader: {
        fontSize: 17,
        fontWeight: '600',
        lineHeight: 22,      
        alignSelf: 'center',
        textAlign: 'center'
    }
})