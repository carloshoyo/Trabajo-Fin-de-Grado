import { API_CONFIG } from "@/constants/config";
import { Colors } from "@/constants/theme";
import { CurrentRenderContext } from "@react-navigation/native";
import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from "react";
import { Text, View, useColorScheme, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal } from "react-native";
import Slider from '@react-native-community/slider'
import * as Haptics from 'expo-haptics'
import { SliderDiscreto } from "@/components/my-components/slider";
import { BlurView } from "expo-blur";
import { EvilIcons, FontAwesome5 } from "@expo/vector-icons";

export default function PersonalityTest() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const [secciones, setSecciones] = useState<any[]>([]);
    const [respuestas, setRespuestas] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [faltanDatos, setFaltanDatos] = useState(false);
    const [datosEnviados, setDatosEnviados] = useState(false);

    useEffect(() => {
        cargarPreguntas();
    }, []);

    const cargarPreguntas = async () => {
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

            if (resultado.success) {
                agruparDatos(resultado.cuestiones);
            }
        } catch(error) {
            console.error('Error: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const agruparDatos = (cuestionesPlanos: any[]) => {
        const agrupado: any[] = [];
        const respuestasIniciales: any = {};

        cuestionesPlanos.forEach((row) => {
            // Creamos la clave maestra (ej. "Higiene y orden" -> "higiene_y_orden")
            const clave_categoria = row.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');

            let grupo = agrupado.find(g => g.titulo === row.categoria);
            if (!grupo) {
                grupo = { titulo: row.categoria, clave_categoria: clave_categoria, preguntas: [] };
                agrupado.push(grupo);
                respuestasIniciales[clave_categoria] = {};
            }

            grupo.preguntas.push(row);
            
            // Inicializamos el slider en el valor neutro (3)
            respuestasIniciales[clave_categoria][row.clave_json] = 3; 
        });

        setSecciones(agrupado);
        setRespuestas(respuestasIniciales);
    };

    const handleCambioSlider = (clave_categoria: string, clave_json: string, valor: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setRespuestas((prev: any) => ({
            ...prev,
            [clave_categoria]: {
                ...prev[clave_categoria],
                [clave_json]: valor
            }
        }));
    };

    const guardarTest = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            
            const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.guardarRespuestasTest}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    perfil_social: respuestas
                })
            });

            const resultado = await respuesta.json();

            if (resultado.success) {
                console.log(resultado.message);
                setDatosEnviados(true);
            } else {
                console.warn("El servidor rechazó el guardado:", resultado.message);
            }
        } catch (error) {
            console.error("Error de red al enviar el test:", error);
        }
    };

    const handleCloseSuccess = () => {
        router.replace('/homeInquilino');
    };

    const handleCloseWarning = () => {
        setFaltanDatos(false);
    };

    return (
        <ScrollView
            style={[styles.container, { 
                backgroundColor: currentColors.background 
            }]}
        >
            {isLoading ? (
                <ActivityIndicator/>
            ) : (
                <></>
            )}
            <View style={[styles.header, {
                borderColor: currentColors.formTextArea
            }]}>
                {/* <Text style={[styles.title, {
                        color: currentColors.formTextColor 
                    }]}
                >
                    Test de Convivencia
                </Text> */}
                <Text style={[styles.subtitle, { color: currentColors.formTextColor }]}>
                    Define qué es importante para ti a la hora de compartir piso.
                </Text>
            </View>

            {secciones.map((seccion, index) => (
                <View key={index} style={[styles.seccionContainer, { 
                        backgroundColor: currentColors.formTextArea,
                        borderColor: currentColors.flatCardBorderColor 
                    }]}
                >
                    <Text style={[styles.tituloSeccion, { color: currentColors.formTextColor }]}>
                        {seccion.titulo}
                    </Text>

                    {seccion.preguntas.map((pregunta: any) => (
                        <View key={pregunta.id_criterio} style={styles.preguntaContainer}>
                            <Text style={{ color: currentColors.placeholderColor, marginBottom: 10, fontSize: 15 }}>
                                {pregunta.pregunta_test}
                            </Text>
                            
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={1}
                                maximumValue={5}
                                step={1}
                                value={respuestas[seccion.clave_categoria]?.[pregunta.clave_json] || 3}
                                onValueChange={(val) => handleCambioSlider(seccion.clave_categoria, pregunta.clave_json, val)}
                                minimumTrackTintColor={currentColors.minimumTrackTintColor}
                                maximumTrackTintColor={currentColors.maximumTrackTintColor}
                                thumbTintColor={currentColors.minimumTrackTintColor}
                            />
                            {/* <SliderDiscreto 
                                valor={{respuestas[seccion.clave_categoria]?.[pregunta.clave_json] ?? 3}}
                                onChange={(val) => handleCambioSlider(seccion.clave_categoria, pregunta.clave_json, val)} 
                                color={currentColors.maximumTrackTintColor}
                            /> */}
                            
                            <View style={styles.etiquetasSlider}>
                                <Text style={{ color: currentColors.placeholderColor, fontSize: 12 }}>Me da igual</Text>
                                <Text style={{ color: currentColors.placeholderColor, fontSize: 12 }}>Es vital</Text>
                            </View>
                        </View>
                    ))}
                </View>
            ))}

            <Pressable 
                style={[styles.botonGuardar, {
                    backgroundColor: currentColors.formButtonColor
                }]}
                onPress={guardarTest}
            >
                <Text style={[styles.textoBoton, {
                    color: currentColors.formTextArea
                }]}>
                    Guardar Mi Perfil
                </Text>
            </Pressable>
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
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 15
    },
    header: { 
        marginBottom: 20,
        borderBottomWidth: 1,
        paddingBottom: 30
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold' 
    },
    subtitle: { 
        fontSize: 12,
        fontWeight: '300',
        marginTop: 5, 
        opacity: 0.8 
    },
    seccionContainer: { 
        padding: 15, 
        borderRadius: 10, 
        // borderWidth: 2,
        marginBottom: 20,
    },
    tituloSeccion: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginBottom: 15 
    },
    preguntaContainer: { 
        marginBottom: 25 
    },
    etiquetasSlider: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingHorizontal: 10 
    },
    botonGuardar: { 
        padding: 15, 
        borderRadius: 10, 
        alignItems: 'center', 
        marginVertical: 20, 
        marginBottom: 50 
    },
    textoBoton: { 
        color: 'white', 
        fontWeight: 'bold', 
        fontSize: 18 
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
});
