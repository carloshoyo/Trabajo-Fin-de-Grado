import { useAd } from "@/context/PostAdContext";
import { router } from "expo-router";
import { Text, TextInput, View, StyleSheet, useColorScheme, ScrollView, Pressable } from "react-native";
import { useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from "@/constants/config";
import { Colors } from "@/constants/theme";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { CHIPS_MULTISELECT, CHIPS_UNICO, TOGGLES_BOOLEANOS } from "@/constants/preferenciasAnuncio";
import { subirImagenes, subirMultimedia } from "@/api/apiUpload";
import { aplanarMultimedia } from "@/components/my-components/carruselImagenes";

// Selecciones únicas adicionales que no están en los chips compartidos pero sí en el cruce
const SELECTS_EXTRA = [
    { label: 'Género buscado', seccion: 'convivencia_normas', campo: 'genero_inquilinos', opciones: ['indiferente', 'masculino', 'femenino'] },
    { label: 'Ocupación', seccion: 'convivencia_normas', campo: 'ocupacion_inquilinos', opciones: ['indiferente', 'solo_estudiantes', 'solo_trabajadores'] },
];

const TOGGLES_EXTRA = [
    { label: 'Climatización', seccion: 'caracteristicas_vivienda', campo: 'climatizacion' },
];

const NUMERICOS = [
    { label: 'Estancia mínima (meses)', seccion: 'economia_contrato', campo: 'estancia_minima_meses' },
    { label: 'Meses de fianza', seccion: 'economia_contrato', campo: 'meses_fianza_max' },
    { label: 'Baños mínimos', seccion: 'caracteristicas_vivienda', campo: 'banos_minimos' },
];

export default function SelectCaracteristicas() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const { adData } = useAd();
    const [isPublishing, setIsPublishing] = useState(false);

    const [caracteristicas, setCaracteristicas] = useState<any>({
        economia_contrato: { gastos_incluidos: [] },
        convivencia_normas: {},
        caracteristicas_vivienda: { tipo_inmueble: [] },
        habitacion: {},
    });

    const toggleMultiselect = (seccion: string, campo: string, opcion: string) => {
        const actual = (caracteristicas[seccion][campo] as string[]) || [];
        const nueva = actual.includes(opcion) ? actual.filter(o => o !== opcion) : [...actual, opcion];
        setCaracteristicas({ ...caracteristicas, [seccion]: { ...caracteristicas[seccion], [campo]: nueva } });
    };

    const setUnico = (seccion: string, campo: string, opcion: string) => {
        const esElMismo = caracteristicas[seccion][campo] === opcion;
        setCaracteristicas({ ...caracteristicas, [seccion]: { ...caracteristicas[seccion], [campo]: esElMismo ? undefined : opcion } });
    };

    const toggleBooleano = (seccion: string, campo: string) => {
        setCaracteristicas({ ...caracteristicas, [seccion]: { ...caracteristicas[seccion], [campo]: !caracteristicas[seccion][campo] } });
    };

    const setNumerico = (seccion: string, campo: string, valor: string) => {
        const num = valor === '' ? undefined : Number(valor);
        setCaracteristicas({ ...caracteristicas, [seccion]: { ...caracteristicas[seccion], [campo]: num } });
    };

    const handlePublicar = async () => {
        setIsPublishing(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');

            // Subimos imágenes (portada + multimedia) antes de publicar
            const multimediaSubida = await subirMultimedia(adData.multimedia);

            // La portada es la PRIMERA foto subida del anuncio (no una imagen genérica)
            const fotosSubidas = aplanarMultimedia(multimediaSubida);
            const portadaSubida = fotosSubidas[0]
                ?? (adData.portada ? (await subirImagenes([adData.portada]))[0] : null);

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
                    ciudad: adData.ciudad,
                    descripcion: adData.descripcion,
                    portada: portadaSubida,
                    precio: adData.precio,
                    multimedia: multimediaSubida,
                    caracteristicas: caracteristicas,
                    userName: adData.userName,
                    area: adData.area,
                    max_inquilinos: adData.max_inquilinos
                }),
            });

            const resultado = await respuesta.json();
            if (resultado.success) {
                router.dismissTo('/homeCasero');
            } else {
                console.warn('No se pudo publicar el anuncio:', resultado.message);
            }
        } catch (error) {
            console.error('Error al publicar el anuncio:', error);
        } finally {
            setIsPublishing(false);
        }
    };

    const renderChipsUnicos = ({ label, seccion, campo, opciones }: any) => (
        <View key={campo} style={{ gap: 8 }}>
            <Text style={{ color: currentColors.formTextColor, fontWeight: '600' }}>{label}</Text>
            <View style={styles.chipsRow}>
                {opciones.map((opcion: string) => {
                    const activo = caracteristicas[seccion][campo] === opcion;
                    return (
                        <Pressable
                            key={opcion}
                            onPress={() => setUnico(seccion, campo, opcion)}
                            style={[styles.chip, { borderColor: currentColors.flatCardBorderColor, backgroundColor: activo ? currentColors.formButtonColor : 'transparent' }]}
                        >
                            <Text style={{ color: activo ? '#fff' : currentColors.formTextColor }}>{opcion}</Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );

    return (
        <View style={[styles.main, { backgroundColor: currentColors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: currentColors.formTextColor }]}>Características de la vivienda</Text>
                    <Pressable onPress={() => router.dismissTo('/homeCasero')}>
                        <EvilIcons name="close-o" size={38} color={currentColors.formTextColor} />
                    </Pressable>
                </View>
                <Text style={[styles.subtitle, { color: currentColors.placeholderColor }]}>
                    Esta información se usa para encontrar a los inquilinos más afines.
                </Text>

                {/* Multiselección: tipo de inmueble, gastos incluidos */}
                {CHIPS_MULTISELECT.map(({ label, seccion, campo, opciones }) => (
                    <View key={campo} style={{ gap: 8 }}>
                        <Text style={{ color: currentColors.formTextColor, fontWeight: '600' }}>{label}</Text>
                        <View style={styles.chipsRow}>
                            {opciones.map(opcion => {
                                const activo = ((caracteristicas[seccion][campo] as string[]) || []).includes(opcion);
                                return (
                                    <Pressable
                                        key={opcion}
                                        onPress={() => toggleMultiselect(seccion, campo, opcion)}
                                        style={[styles.chip, { borderColor: currentColors.flatCardBorderColor, backgroundColor: activo ? currentColors.formButtonColor : 'transparent' }]}
                                    >
                                        <Text style={{ color: activo ? '#fff' : currentColors.formTextColor }}>{opcion}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                ))}

                {/* Selección única: ambiente, visitas, limpieza + género y ocupación */}
                {CHIPS_UNICO.map(renderChipsUnicos)}
                {SELECTS_EXTRA.map(renderChipsUnicos)}

                {/* Valores numéricos */}
                {NUMERICOS.map(({ label, seccion, campo }) => (
                    <View key={campo} style={{ gap: 8 }}>
                        <Text style={{ color: currentColors.formTextColor, fontWeight: '600' }}>{label}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: currentColors.formTextArea, color: currentColors.formTextColor, borderColor: currentColors.flatCardBorderColor }]}
                            keyboardType="numeric"
                            value={caracteristicas[seccion][campo]?.toString() ?? ''}
                            onChangeText={(v) => setNumerico(seccion, campo, v)}
                            placeholder="0"
                            placeholderTextColor={currentColors.placeholderColor}
                        />
                    </View>
                ))}

                {/* Booleanos: características de la vivienda/habitación + climatización */}
                <View style={{ gap: 8 }}>
                    <Text style={{ color: currentColors.formTextColor, fontWeight: '600' }}>Características</Text>
                    <View style={styles.chipsRow}>
                        {[...TOGGLES_BOOLEANOS, ...TOGGLES_EXTRA].map(({ label, seccion, campo }) => {
                            const activo = !!caracteristicas[seccion][campo];
                            return (
                                <Pressable
                                    key={campo}
                                    onPress={() => toggleBooleano(seccion, campo)}
                                    style={[styles.chip, { borderColor: currentColors.flatCardBorderColor, backgroundColor: activo ? currentColors.formButtonColor : 'transparent' }]}
                                >
                                    <Text style={{ color: activo ? '#fff' : currentColors.formTextColor }}>{label}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <Pressable
                    style={[styles.botonPublicar, { backgroundColor: currentColors.formButtonColor, opacity: isPublishing ? 0.7 : 1 }]}
                    onPress={handlePublicar}
                    disabled={isPublishing}
                >
                    <Text style={styles.textoBoton}>{isPublishing ? 'Publicando...' : 'Publicar anuncio'}</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    main: { flex: 1 },
    scrollContent: { padding: 20, paddingTop: 50, paddingBottom: 60, gap: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', flex: 1 },
    subtitle: { fontSize: 13, marginTop: -12 },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
    botonPublicar: { width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    textoBoton: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
