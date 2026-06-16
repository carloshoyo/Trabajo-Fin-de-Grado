import { Colors } from "@/constants/theme";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useState } from "react";
import { Text, View, useColorScheme, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";


export function BotonExpandible({buscadores, onCambiar}: {buscadores: string[], onCambiar?: (b: string) => void}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const [buscadorActivo, setBuscadorActivo] = useState(buscadores[0]);
    const [toggleBuscador, setToggleBuscador] = useState(false);

    const cambiarBuscador = (buscador: string) => {
        setBuscadorActivo(buscador);
        setToggleBuscador(false);
        onCambiar?.(buscador);
    }

    const abrirToggleBuscador = () => {
        setToggleBuscador(!toggleBuscador);
    }
    
    return (
        <View style={[styles.toggleBuscadorContainer]}>
                    {toggleBuscador ? (
                        <View style={[styles.toggleAbiertoContainer]}>
                            {buscadores.map((busc, index) => (
                                <Pressable key={index} onPress={() => cambiarBuscador(busc)} style={[styles.toggleBuscador, {
                                    backgroundColor: currentColors.background,
                                    borderColor: currentColors.flatCardBorderColor,
                                    borderBottomWidth: 1,
                                }]}>
                                    <Text style={[styles.toggleButtonText, {
                                        color: currentColors.formTextColor
                                    }]}>
                                        {busc}
                                    </Text>
                                    {buscadorActivo === busc ? (
                                        <FontAwesome5 name="check" size={18} color={currentColors.acceptRequest} />
                                    ) : (
                                        <></>
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    ): (
                        <></>
                    )}
                    
                    <Pressable onPress={abrirToggleBuscador}style={[styles.toggleBuscador, {
                        backgroundColor: currentColors.background,
                        borderWidth: 1,
                        borderColor: currentColors.flatCardBorderColor
                    }]}>
                        <Text style={[styles.toggleButtonText, {
                            color: currentColors.formTextColor
                        }]}>
                            {buscadorActivo}
                        </Text>
                        <SimpleLineIcons name={toggleBuscador ? "arrow-up" : "arrow-down"} size={12} color={currentColors.flatCardBorderColor} />
                    </Pressable>    
                </View>
    )
}

const styles = StyleSheet.create({
    toggleBuscadorContainer: {
        width: '75%',
        alignItems: 'center',
        alignSelf: 'center'
    },
    toggleBuscador: {
        padding: 10,
        borderRadius: 10,
        width: '100%',
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleAbiertoContainer: {
        position: 'absolute',
        top: '100%',       // se pega justo debajo del botón padre
        left: 0,
        right: 0,          // mismo ancho que el botón
        borderRadius: 8,
        zIndex: 100,
        elevation: 5,      // sombra en Android para que flote visualmente
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    toggleButtonText: {
        fontSize: 18,
        fontWeight: '600',
    }
})