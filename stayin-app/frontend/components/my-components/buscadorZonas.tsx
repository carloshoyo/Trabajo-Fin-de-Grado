import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, useColorScheme, Alert } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Colors } from '@/constants/theme';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function BuscadorZonas({ onZonaSeleccionada }: { onZonaSeleccionada: (codigosPostales: string[], ciudad: string | null, ubicacion: any) => void }) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const insets = useSafeAreaInsets(); // Medidas del dispositivo    
    const [modalVisible, setModalVisible] = useState(false);
    const [zonaVisual, setZonaVisual] = useState('');

    return (
        <View style={{ width: '100%', marginBottom: 15 }}>
            
            <Pressable
                style={[styles.fakeInput, { 
                    backgroundColor: currentColors.formTextArea, 
                    borderColor: currentColors.flatCardBorderColor 
                }]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={{ 
                    color: zonaVisual ? currentColors.formTextColor : currentColors.placeholderColor, 
                    fontSize: 16, 
                    flex: 1 
                }}>
                    {zonaVisual || "Ej. Ronda, Zaidín, Centro..."}
                </Text>
                <EvilIcons name="search" size={24} color={currentColors.placeholderColor} />
            </Pressable>

            <Modal visible={modalVisible} animationType="slide" transparent={false}>
                <View style={{ 
                    flex: 1, 
                    backgroundColor: currentColors.background,
                    paddingTop: insets.top, // Empuja el contenido debajo de la barra de estado
                    paddingBottom: insets.bottom // Empuja el contenido por encima de la barra de gestos de Android/iOS
                }}>
                    
                    <View style={styles.modalHeader}>
                        <Pressable onPress={() => setModalVisible(false)} style={{ padding: 10, marginLeft: 5 }}>
                            <EvilIcons name="close-o" size={30} color={currentColors.formTextColor} />
                        </Pressable>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: currentColors.formTextColor }}>
                            Busca un barrio
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <GooglePlacesAutocomplete
                        placeholder="Escribe el nombre de la calle o barrio..."
                        fetchDetails={true}
                        // autoFocus={true} 
                        onFail={(error) => console.error('[Places] Fallo:', error)}
                        onNotFound={() => console.warn('[Places] Sin resultados de detalles')}

                        
                        onPress={(data, details = null) => {
                            // Actualizamos la vista visual inmediatamente para el usuario
                            setZonaVisual(data.description);
                            setModalVisible(false);

                            // Extraemos el texto base por si los detalles de Google fallan
                            let ciudad = data.structured_formatting?.main_text || data.description.split(',')[0];
                            let codigoPostal = null;
                            let ubicacion = null;

                            if (details && details.address_components) {
                                // Extraer Código Postal
                                const postalCodeObj = details.address_components.find((c: any) => c.types.includes('postal_code'));
                                if (postalCodeObj) codigoPostal = postalCodeObj.long_name;

                                // Extraer Ciudad (buscando en todas las etiquetas posibles de Google)
                                const ciudadObj = details.address_components.find((c: any) => 
                                    c.types.includes('locality') || 
                                    c.types.includes('administrative_area_level_2') ||
                                    c.types.includes('postal_town')
                                );
                                if (ciudadObj) ciudad = ciudadObj.long_name;

                                ubicacion = details.geometry?.location || null;
                            }

                            // Enviamos los datos asegurando que 'ciudad' nunca vaya vacía
                            onZonaSeleccionada(
                                codigoPostal ? [codigoPostal] : [], 
                                ciudad, 
                                ubicacion
                            );
                        }}
                        
                        query={{
                            key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
                            language: 'es',
                            components: 'country:es',
                            types: 'geocode'
                        }}
                        
                        keyboardShouldPersistTaps="handled" 
                            
                        keepResultsAfterBlur={true}
                        
                        styles={{
                            container: {
                                flex: 1,
                                paddingHorizontal: 15,
                                marginTop: 10
                            },
                            textInput: {
                                backgroundColor: currentColors.formTextArea,
                                color: currentColors.formTextColor,
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: currentColors.flatCardBorderColor,
                                height: 50,
                                paddingHorizontal: 15,
                                fontSize: 16,
                            },
                            listView: {
                                backgroundColor: currentColors.background,
                                marginTop: 10,
                            },
                            row: {
                                backgroundColor: currentColors.background,
                                paddingVertical: 15,
                                flexDirection: 'row',
                            },
                            separator: {
                                height: 1,
                                backgroundColor: currentColors.flatCardBorderColor,
                                opacity: 0.3
                            },
                            description: {
                                color: currentColors.formTextColor,
                                fontSize: 15,
                            }
                        }}
                        
                        textInputProps={{
                            placeholderTextColor: currentColors.placeholderColor,
                            clearButtonMode: 'always', // para que funcione al pulsar en el modal con el teclado abirto
                        }}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    fakeInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
        borderWidth: 2,
        height: 55,
        paddingHorizontal: 15,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)'
    }
});