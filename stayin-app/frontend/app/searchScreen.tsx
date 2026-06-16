import { NavBar } from "@/components/my-components/navBar";
import { Colors } from "@/constants/theme";
import { Text, View, useColorScheme, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import Slider from "@react-native-community/slider";
import { BotonExpandible } from "@/components/my-components/botonExpandible";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete"
import { BuscadorZonas } from "@/components/my-components/buscadorZonas";
import { FlatCard } from "@/components/my-components/flatCard";
import * as SecureStore from 'expo-secure-store';
import { buscarAnunciosVolatil, buscarCompanerosVolatil } from "@/api/apiRecomendar";
import React, { useRef } from 'react';
import { UserCard } from "@/components/my-components/userCard";

interface FiltrosCompañero {
    ciudad: string;
    zona?: string[];
    mascota?: boolean;
    fuma?: boolean;
    estudiante?: boolean
}

interface FiltrosAnuncio {
    precio_max?: number;
    zona?: string;
    economia_contrato: {
        gastos_incluidos: string[];
        estancia_minima_meses?: number;
        meses_fianza_max?: number;
    };
    convivencia_normas: {
        ambiente?: string;
        visitas?: string;
        limpieza?: string;
        ocupacion_inquilinos?: string;
        genero_inquilinos?: string;
        'lgtb-friendly'?: boolean;
    };
    caracteristicas_vivienda: {
        tipo_inmueble: string[];
        banos_minimos?: number;
        ascensor?: boolean;
        climatizacion?: string;
    };
    habitacion: {
        cama_doble?: boolean;
        zona_estudio?: boolean;
        bano_privado?: boolean;
    };
}

const CHIPS_MULTISELECT = [
    { label: 'Tipo de inmueble', seccion: 'caracteristicas_vivienda', campo: 'tipo_inmueble',
      opciones: ['piso', 'ático', 'dúplex', 'bajo', 'estudio'] },
    { label: 'Gastos incluidos', seccion: 'economia_contrato', campo: 'gastos_incluidos',
      opciones: ['agua', 'internet', 'luz', 'gas'] },
];

const CHIPS_UNICO = [
    { label: 'Ambiente', seccion: 'convivencia_normas', campo: 'ambiente',
      opciones: ['estudio', 'tranquilo', 'animado'] },
    { label: 'Visitas', seccion: 'convivencia_normas', campo: 'visitas',
      opciones: ['rara_vez', 'ocasional', 'a_menudo'] },
    { label: 'Limpieza', seccion: 'convivencia_normas', campo: 'limpieza',
      opciones: ['ocasional', 'a_menudo', 'turnos_estrictos'] },
];

const TOGGLES_BOOLEANOS = [
    { label: 'Baño privado',  seccion: 'habitacion',              campo: 'bano_privado' },
    { label: 'Cama doble',    seccion: 'habitacion',              campo: 'cama_doble' },
    { label: 'Zona estudio',  seccion: 'habitacion',              campo: 'zona_estudio' },
    { label: 'Ascensor',      seccion: 'caracteristicas_vivienda', campo: 'ascensor' },
    { label: 'LGBT-friendly', seccion: 'convivencia_normas',      campo: 'lgtb-friendly' },
];

const TOGGLES_COMPANEROS = [
    { label: 'Sin mascota', campo: 'mascota' },
    { label: 'No fumador', campo: 'fuma' },
    { label: 'Estudiante', campo: 'estudiante'},
];

export default function SearchScreen({solicitudes, valoraciones}: {solicitudes: number, valoraciones: number}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const buscadores = ['Compañeros', 'Anuncios'];
    const [buscadorActivo, setBuscadorActivo] = useState('Compañeros');
    const [precioMax, setPrecioMax] = useState(1000);
    const [resultadosAnuncios, setResultadosAnuncios] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [resultadosCompaneros, setResultadosCompaneros] = useState<any[] | null>(null);

    const [filtros, setFiltros] = useState<FiltrosAnuncio>({
        economia_contrato: { gastos_incluidos: [] },
        convivencia_normas: {},
        caracteristicas_vivienda: { tipo_inmueble: [] },
        habitacion: {}
    });
    const [filtrosCompanero, setFiltrosCompanero] = useState<FiltrosCompañero>({
        ciudad: ''
    });

    const toggleBooleanoCompanero = (campo: string) => {
        setFiltrosCompanero({ ...filtrosCompanero, [campo]: !(filtrosCompanero as any)[campo] });
    };

    const toggleMultiselect = (seccion: string, campo: string, opcion: string) => {
        const actual = ((filtros as any)[seccion][campo] as string[]);
        const nueva = actual.includes(opcion)
            ? actual.filter((o: string) => o !== opcion)
            : [...actual, opcion];
        setFiltros({ ...filtros, [seccion]: { ...(filtros as any)[seccion], [campo]: nueva } });
    };

    const setUnico = (seccion: string, campo: string, opcion: string) => {
        const esElMismo = (filtros as any)[seccion][campo] === opcion;
        setFiltros({ ...filtros, [seccion]: { ...(filtros as any)[seccion], [campo]: esElMismo ? undefined : opcion } });
    };

    const toggleBooleano = (seccion: string, campo: string) => {
        setFiltros({ ...filtros, [seccion]: { ...(filtros as any)[seccion], [campo]: !(filtros as any)[seccion][campo] } });
    };

    const onZonaSeleccionada = (codigosPostales: string[], ciudad: string | null, ubicacion: any) => {
        setFiltrosCompanero(prev => ({ 
            ...prev, 
            ciudad: ciudad ?? '',
            zona: codigosPostales // ¡Faltaba esta línea para guardar los barrios!
        }));
    }

    const handleBuscarAnuncios = async () => {
        setIsLoading(true);
        try {
            const strIdUsuario = await SecureStore.getItemAsync('userId');
            if (!strIdUsuario) return;
            const idUsuario = parseInt(strIdUsuario, 10);
            
            // Llamamos a la API centralizada pasando los parámetros
            const datos = await buscarAnunciosVolatil({
                id_inquilino: idUsuario,
                presupuesto_max: precioMax,
                zona: filtrosCompanero.zona || [],
                ciudad: filtrosCompanero.ciudad || '',
                preferencias: filtros
            });
            
            // Formateamos los datos recibidos
            const anunciosFormateados = datos.map((item: any) => ({
                ...item.vivienda_data,
                score_afinidad: item.score_afinidad
            }));

            setResultadosAnuncios(anunciosFormateados);
        } catch (error) {
            console.error("Error ejecutando la búsqueda:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBuscarCompaneros = async () => {
        setIsLoading(true);
        try {
            const strIdUsuario = await SecureStore.getItemAsync('userId');
            if (!strIdUsuario) return;
            const idUsuario = parseInt(strIdUsuario, 10);
            
            const datos = await buscarCompanerosVolatil({
                id_inquilino: idUsuario,
                presupuesto_max: 0, // No aplica para compañeros
                zona: filtrosCompanero.zona || [],
                ciudad: filtrosCompanero.ciudad || '',
                preferencias: filtrosCompanero // Pasamos los filtros de compañero (fuma, mascota...)
            });
            
            setResultadosCompaneros(datos);
        } catch (error) {
            console.error("Error buscando compañeros:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.main}>
            <View style={[styles.imgContainer, { borderColor: currentColors.formBorderColor }]}>
                <Image
                    style={styles.img}
                    source={require('../assets/images/flat_img.png')}
                    contentFit="cover"
                />
            </View>
            <ScrollView
                style={{ flex: 1, backgroundColor: currentColors.background }}
                contentContainerStyle={[styles.scrollContent, { backgroundColor: currentColors.background }]}
            >
                <BotonExpandible buscadores={buscadores} onCambiar={setBuscadorActivo} />
                <BuscadorZonas onZonaSeleccionada={onZonaSeleccionada}/>
                {buscadorActivo === 'Anuncios' ? (
                    resultadosAnuncios !== null ? (
                        // 1. VISTA DE RESULTADOS (Si ya hemos buscado)
                        <View style={{ gap: 20 }}>
                            <Pressable onPress={() => setResultadosAnuncios(null)} style={{ paddingVertical: 10 }}>
                                <Text style={{ color: currentColors.formTextColor, fontWeight: 'bold' }}>
                                    ← Volver a los filtros
                                </Text>
                            </Pressable>
                            
                            {resultadosAnuncios.length === 0 ? (
                                <Text style={{ color: currentColors.placeholderColor, textAlign: 'center', marginTop: 50 }}>
                                    No se encontraron anuncios para esta búsqueda específica.
                                </Text>
                            ) : (
                                resultadosAnuncios.map((item) => (
                                    <FlatCard 
                                        key={item.id_anuncio}
                                        title={item.titulo}
                                        img={require('../assets/images/flat_img.png')}
                                        direccion={item.direccion}
                                        precio={item.precio}
                                        descripcion={item.descripcion}
                                        area={item.area}
                                        max_inquilinos={item.max_inquilinos}
                                        id_anuncio={item.id_anuncio}
                                        es_favorito={item.es_favorito}
                                    />
                                ))
                            )}
                        </View>
                    ) : (
                        // 2. VISTA DE FORMULARIO (Lo que ya tenías)
                        <View style={{ gap: 32 }}>

                            <View style={{ gap: 8 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: currentColors.formTextColor, fontWeight: '600' }}>
                                        Precio máximo
                                    </Text>
                                    <Text style={{ color: currentColors.formTextColor }}>
                                        {precioMax}€/mes
                                    </Text>
                                </View>
                                <Slider
                                    style={{ width: '100%', height: 40 }}
                                    minimumValue={100}
                                    maximumValue={2000}
                                    step={50}
                                    value={precioMax}
                                    onValueChange={setPrecioMax}
                                    minimumTrackTintColor={currentColors.minimumTrackTintColor}
                                    maximumTrackTintColor={currentColors.maximumTrackTintColor}
                                    thumbTintColor={currentColors.minimumTrackTintColor}
                                />
                            </View>

                            {CHIPS_MULTISELECT.map(({ label, seccion, campo, opciones }) => (
                                <View key={campo} style={{ gap: 8 }}>
                                    <Text style={{ color: currentColors.formTextColor, fontWeight: '600' }}>{label}</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        {opciones.map(opcion => {
                                            const activo = ((filtros as any)[seccion][campo] as string[]).includes(opcion);
                                            return (
                                                <Pressable
                                                    key={opcion}
                                                    onPress={() => toggleMultiselect(seccion, campo, opcion)}
                                                    style={[styles.chip, {
                                                        borderColor: currentColors.flatCardBorderColor,
                                                        backgroundColor: activo ? currentColors.formButtonColor : 'transparent'
                                                    }]}
                                                >
                                                    <Text style={{ color: activo ? '#fff' : currentColors.formTextColor }}>
                                                        {opcion}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>
                            ))}

                            {CHIPS_UNICO.map(({ label, seccion, campo, opciones }) => (
                                <View key={campo} style={{ gap: 8 }}>
                                    <Text style={{ color: currentColors.formTextColor, fontWeight: '600' }}>{label}</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        {opciones.map(opcion => {
                                            const activo = (filtros as any)[seccion][campo] === opcion;
                                            return (
                                                <Pressable
                                                    key={opcion}
                                                    onPress={() => setUnico(seccion, campo, opcion)}
                                                    style={[styles.chip, {
                                                        borderColor: currentColors.flatCardBorderColor,
                                                        backgroundColor: activo ? currentColors.formButtonColor : 'transparent'
                                                    }]}
                                                >
                                                    <Text style={{ color: activo ? '#fff' : currentColors.formTextColor }}>
                                                        {opcion}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>
                            ))}

                            <View style={{ gap: 8 }}>
                                <Text style={{ color: currentColors.formTextColor, fontWeight: '600' }}>Características</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                    {TOGGLES_BOOLEANOS.map(({ label, seccion, campo }) => {
                                        const activo = !!(filtros as any)[seccion][campo];
                                        return (
                                            <Pressable
                                                key={campo}
                                                onPress={() => toggleBooleano(seccion, campo)}
                                                style={[styles.chip, {
                                                    borderColor: currentColors.flatCardBorderColor,
                                                    backgroundColor: activo ? currentColors.formButtonColor : 'transparent'
                                                }]}
                                            >
                                                <Text style={{ color: activo ? '#fff' : currentColors.formTextColor }}>
                                                    {label}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                            
                            <Pressable 
                                style={[styles.botonBuscar, { 
                                    backgroundColor: currentColors.formButtonColor,
                                    opacity: isLoading ? 0.7 : 1
                                }]}
                                onPress={handleBuscarAnuncios}
                                disabled={isLoading}
                            >
                                <Text style={{ 
                                    color: '#fff', 
                                    fontWeight: '600', 
                                    fontSize: 16 }}
                                >
                                    {isLoading ? 'Buscando...' : 'Buscar'}
                                </Text>
                            </Pressable>
                        </View>
                    )
                ) : (
                    resultadosCompaneros !== null ? (
                        <View style={{ gap: 20 }}>
                            <Pressable onPress={() => setResultadosCompaneros(null)} style={{ paddingVertical: 10 }}>
                                <Text style={{ color: currentColors.formTextColor, fontWeight: 'bold' }}>
                                    ← Volver a los filtros
                                </Text>
                            </Pressable>
                            
                            {resultadosCompaneros.length === 0 ? (
                                <Text style={{ color: currentColors.placeholderColor, textAlign: 'center', marginTop: 50 }}>
                                    No se encontraron compañeros afines en esta zona.
                                </Text>
                            ) : (
                                // Usamos un View o FlatList para renderizar las tarjetas
                                <View style={{ gap: 15, alignItems: 'center' }}>
                                    {resultadosCompaneros.map((comp) => (
                                        <UserCard 
                                            key={comp.id_inquilino}
                                            name={comp.nombre || comp.username}
                                            scoring={comp.score_afinidad}
                                        />
                                    ))}
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={{ gap: 32 }}>
                            <View style={{ gap: 8 }}>
                                <Text style={{ color: currentColors.formTextColor, fontWeight: '600' }}>
                                    Características
                                </Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                    {TOGGLES_COMPANEROS.map(({ label, campo }) => {
                                        const activo = !!(filtrosCompanero as any)[campo];
                                        return (
                                            <Pressable
                                                key={campo}
                                                onPress={() => toggleBooleanoCompanero(campo)}
                                                style={[styles.chip, {
                                                    borderColor: currentColors.flatCardBorderColor,
                                                    backgroundColor: activo ? currentColors.formButtonColor : 'transparent'
                                                }]}
                                            >
                                                <Text style={{ color: activo ? '#fff' : currentColors.formTextColor }}>
                                                    {label}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                            <Pressable 
                                style={[styles.botonBuscar, { 
                                    backgroundColor: currentColors.formButtonColor,
                                    opacity: isLoading ? 0.7 : 1
                                }]}
                                onPress={handleBuscarCompaneros}
                                disabled={isLoading}
                            >
                                <Text style={{ 
                                    color: '#fff', 
                                    fontWeight: '600', 
                                    fontSize: 16 }}
                                >
                                    {isLoading ? 'Buscando...' : 'Buscar'}
                                </Text>
                            </Pressable>
                        </View>
                    )
                )}
            </ScrollView>
            <NavBar
                active="search"
                solicitudes={solicitudes}
                valoraciones={valoraciones}
                home={'/homeInquilino'}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        position: 'relative'
    },
    scrollContent: {
        paddingBottom: 120,
        paddingTop: 50,
        padding: 30,
        gap: 40
    },
    img: {
        width: '100%',
        height: '100%',
    },
    imgContainer: {
        width: '100%',
        height: '35%',
        borderBottomWidth: 4
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    inputCiudad: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
    },
    botonBuscar: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    }
})
