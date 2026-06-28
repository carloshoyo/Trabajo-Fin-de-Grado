import { NavBar } from "@/components/my-components/navBar";
import { Colors } from "@/constants/theme";
import {
    Image, Text, View, useColorScheme, StyleSheet, ScrollView, Pressable,
    ActivityIndicator, TextInput, Modal,
    ImageSourcePropType
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";
import { EvilIcons, FontAwesome5 } from "@expo/vector-icons";
import { BuscadorZonas } from "@/components/my-components/buscadorZonas";
import { CHIPS_MULTISELECT, CHIPS_UNICO, TOGGLES_BOOLEANOS } from "@/constants/preferenciasAnuncio";
import { getPerfilInquilino, actualizarPerfilInquilino } from "@/api/apiPerfil";
import { useLogin } from "@/context/LoginContext";

const TOGGLES_INQUILINO = [
    { label: 'Fumador', campo: 'fuma' },
    { label: 'Tengo mascota', campo: 'mascota' },
    { label: 'Estudiante', campo: 'estudiante' },
];

// Garantiza que las secciones y arrays existan para que los helpers de chips no fallen.
const normalizarPreferencias = (p: any) => ({
    economia_contrato: {
        ...(p?.economia_contrato ?? {}),
        gastos_incluidos: p?.economia_contrato?.gastos_incluidos ?? [],
    },
    convivencia_normas: { ...(p?.convivencia_normas ?? {}) },
    caracteristicas_vivienda: {
        ...(p?.caracteristicas_vivienda ?? {}),
        tipo_inmueble: p?.caracteristicas_vivienda?.tipo_inmueble ?? [],
    },
    habitacion: { ...(p?.habitacion ?? {}) },
});

export default function EditProfile({img}: {img?: ImageSourcePropType}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const { logout } = useLogin();
    const params = useLocalSearchParams();
    const solicitudes = Number(params.solicitudes ?? 0);
    const valoraciones = Number(params.valoraciones ?? 0);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [datosGuardados, setDatosGuardados] = useState(false);
    const [confirmarLogout, setConfirmarLogout] = useState(false);
    const [edit, setEdit] = useState(false);

    // Datos personales
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [descripcion, setDescripcion] = useState('');

    // Datos de inquilino
    const [datosInquilino, setDatosInquilino] = useState({ fuma: false, mascota: false, estudiante: false });

    // Preferencias de búsqueda
    const [presupuestoMax, setPresupuestoMax] = useState(1000);
    const [zona, setZona] = useState<string[]>([]);
    const [ciudad, setCiudad] = useState('');
    const [preferencias, setPreferencias] = useState<any>(normalizarPreferencias(null));

    useFocusEffect(
        useCallback(() => {
            let activo = true;
            const cargarPerfil = async () => {
                setIsLoading(true);
                try {
                    const perfil = await getPerfilInquilino();
                    if (!activo) return;
                    setNombre(perfil.nombre ?? '');
                    setApellidos(perfil.apellidos ?? '');
                    setDescripcion(perfil.descripcion ?? '');
                    setDatosInquilino({
                        fuma: !!perfil.fuma,
                        mascota: !!perfil.mascota,
                        estudiante: !!perfil.estudiante,
                    });
                    setPresupuestoMax(perfil.presupuesto_max ?? 1000);
                    setZona(perfil.zona ?? []);
                    setCiudad(perfil.ciudad ?? '');
                    setPreferencias(normalizarPreferencias(perfil.preferencias));
                } catch (error) {
                    console.error('Error cargando el perfil: ', error);
                } finally {
                    if (activo) setIsLoading(false);
                }
            };
            cargarPerfil();
            return () => { activo = false; };
        }, [])
    );

    const toggleInquilino = (campo: string) => {
        setDatosInquilino(prev => ({ ...prev, [campo]: !(prev as any)[campo] }));
    };

    const toggleMultiselect = (seccion: string, campo: string, opcion: string) => {
        const actual = (preferencias[seccion][campo] as string[]);
        const nueva = actual.includes(opcion)
            ? actual.filter((o: string) => o !== opcion)
            : [...actual, opcion];
        setPreferencias({ ...preferencias, [seccion]: { ...preferencias[seccion], [campo]: nueva } });
    };

    const setUnico = (seccion: string, campo: string, opcion: string) => {
        const esElMismo = preferencias[seccion][campo] === opcion;
        setPreferencias({ ...preferencias, [seccion]: { ...preferencias[seccion], [campo]: esElMismo ? undefined : opcion } });
    };

    const toggleBooleano = (seccion: string, campo: string) => {
        setPreferencias({ ...preferencias, [seccion]: { ...preferencias[seccion], [campo]: !preferencias[seccion][campo] } });
    };

    const onZonaSeleccionada = (codigosPostales: string[], ciudadSel: string | null) => {
        setZona(codigosPostales);
        setCiudad(ciudadSel ?? '');
    };

    const handleGuardar = async () => {
        setIsSaving(true);
        try {
            await actualizarPerfilInquilino({
                nombre,
                apellidos,
                descripcion,
                fuma: datosInquilino.fuma,
                mascota: datosInquilino.mascota,
                estudiante: datosInquilino.estudiante,
                presupuesto_max: presupuestoMax,
                zona,
                ciudad,
                preferencias,
            });
            setDatosGuardados(true);
        } catch (error) {
            console.error('Error al guardar el perfil: ', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={[styles.main, { backgroundColor: currentColors.background }]}>
            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={currentColors.formButtonColor} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={[styles.titulo, { color: currentColors.formTextColor }]}>Mi perfil</Text>
                    {!edit ? (
                        <View style={styles.seccion}>
                            <View>
                                <View style={[styles.userImageContainer]}>
                                    {img ? (
                                        <Image
                                            source={img}
                                        />
                                    ) : (
                                        <FontAwesome5 name="user-circle" size={96} color={currentColors.formBorderColor}/>
                                    )}
                                    <Text style={[styles.nombreCompleto, { color: currentColors.formTextColor }]}>
                                        {nombre} {apellidos}
                                    </Text>                                    
                                </View>
                            </View>
                            <Pressable
                                style={[styles.botonEditar, { backgroundColor: currentColors.formButtonColor }]}
                                onPress={() => setEdit(true)}
                            >
                                <Text style={styles.textoBotonGuardar}>Editar perfil</Text>
                            </Pressable>
                        </View>
                    ) : (
                    <>
                    {/* Datos personales */}
                    <View style={styles.seccion}>
                        <Text style={[styles.tituloSeccion, { color: currentColors.formTextColor }]}>Datos personales</Text>
                        <Text style={[styles.label, { color: currentColors.placeholderColor }]}>Nombre</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: currentColors.formTextArea, color: currentColors.formTextColor, borderColor: currentColors.flatCardBorderColor }]}
                            value={nombre}
                            onChangeText={setNombre}
                            placeholder="Nombre"
                            placeholderTextColor={currentColors.placeholderColor}
                        />
                        <Text style={[styles.label, { color: currentColors.placeholderColor }]}>Apellidos</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: currentColors.formTextArea, color: currentColors.formTextColor, borderColor: currentColors.flatCardBorderColor }]}
                            value={apellidos}
                            onChangeText={setApellidos}
                            placeholder="Apellidos"
                            placeholderTextColor={currentColors.placeholderColor}
                        />
                        <Text style={[styles.label, { color: currentColors.placeholderColor }]}>Descripción</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: currentColors.formTextArea, color: currentColors.formTextColor, borderColor: currentColors.flatCardBorderColor }]}
                            value={descripcion}
                            onChangeText={setDescripcion}
                            placeholder="Cuéntale a tus futuros compañeros cómo eres..."
                            placeholderTextColor={currentColors.placeholderColor}
                            multiline
                            maxLength={500}
                        />
                    </View>

                    {/* Datos de inquilino */}
                    <View style={styles.seccion}>
                        <Text style={[styles.tituloSeccion, { color: currentColors.formTextColor }]}>Sobre mí</Text>
                        <View style={styles.chipsRow}>
                            {TOGGLES_INQUILINO.map(({ label, campo }) => {
                                const activo = !!(datosInquilino as any)[campo];
                                return (
                                    <Pressable
                                        key={campo}
                                        onPress={() => toggleInquilino(campo)}
                                        style={[styles.chip, { borderColor: currentColors.flatCardBorderColor, backgroundColor: activo ? currentColors.formButtonColor : 'transparent' }]}
                                    >
                                        <Text style={{ color: activo ? '#fff' : currentColors.formTextColor }}>{label}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {/* Preferencias de búsqueda */}
                    <View style={styles.seccion}>
                        <Text style={[styles.tituloSeccion, { color: currentColors.formTextColor }]}>Preferencias de búsqueda</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ color: currentColors.formTextColor, fontWeight: '600' }}>Precio máximo</Text>
                            <Text style={{ color: currentColors.formTextColor }}>{presupuestoMax}€/mes</Text>
                        </View>
                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={100}
                            maximumValue={2000}
                            step={50}
                            value={presupuestoMax}
                            onValueChange={setPresupuestoMax}
                            minimumTrackTintColor={currentColors.minimumTrackTintColor}
                            maximumTrackTintColor={currentColors.maximumTrackTintColor}
                            thumbTintColor={currentColors.minimumTrackTintColor}
                        />

                        <Text style={[styles.label, { color: currentColors.placeholderColor }]}>
                            Zona {ciudad ? `· actual: ${ciudad}${zona.length ? ` (${zona.join(', ')})` : ''}` : ''}
                        </Text>
                        <BuscadorZonas onZonaSeleccionada={onZonaSeleccionada} />

                        {CHIPS_MULTISELECT.map(({ label, seccion, campo, opciones }) => (
                            <View key={campo} style={{ gap: 8 }}>
                                <Text style={{ color: currentColors.formTextColor, fontWeight: '600' }}>{label}</Text>
                                <View style={styles.chipsRow}>
                                    {opciones.map(opcion => {
                                        const activo = (preferencias[seccion][campo] as string[]).includes(opcion);
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

                        {CHIPS_UNICO.map(({ label, seccion, campo, opciones }) => (
                            <View key={campo} style={{ gap: 8 }}>
                                <Text style={{ color: currentColors.formTextColor, fontWeight: '600' }}>{label}</Text>
                                <View style={styles.chipsRow}>
                                    {opciones.map(opcion => {
                                        const activo = preferencias[seccion][campo] === opcion;
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
                        ))}

                        <View style={{ gap: 8 }}>
                            <Text style={{ color: currentColors.formTextColor, fontWeight: '600' }}>Características</Text>
                            <View style={styles.chipsRow}>
                                {TOGGLES_BOOLEANOS.map(({ label, seccion, campo }) => {
                                    const activo = !!preferencias[seccion][campo];
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
                    </View>

                    <Pressable
                        style={[styles.botonGuardar, { backgroundColor: currentColors.formButtonColor, opacity: isSaving ? 0.7 : 1 }]}
                        onPress={handleGuardar}
                        disabled={isSaving}
                    >
                        <Text style={styles.textoBotonGuardar}>{isSaving ? 'Guardando...' : 'Guardar cambios'}</Text>
                    </Pressable>
                    </>
                    )}
                    <Pressable style={styles.botonLogout} onPress={() => setConfirmarLogout(true)}>
                        <Text style={[styles.textoLogout, { color: currentColors.notificationsColor }]}>Cerrar sesión</Text>
                    </Pressable>
                </ScrollView>
            )}

            {/* Modal de éxito */}
            <Modal visible={datosGuardados} transparent animationType="fade">
                <BlurView style={styles.blurView} intensity={40} tint={currentColors.blurStyle as any}>
                    <View style={[styles.modalContainer, { backgroundColor: currentColors.formTextArea }]}>
                        <FontAwesome5 name="check" size={24} color={currentColors.acceptRequest} />
                        <Text style={[styles.modalHeaderText, { color: currentColors.formTextColor }]}>
                            Perfil actualizado correctamente
                        </Text>
                        <Pressable style={styles.closingIcon} onPress={() => { setDatosGuardados(false); setEdit(false); }}>
                            <EvilIcons name="close-o" size={24} color={currentColors.placeholderColor} />
                        </Pressable>
                    </View>
                </BlurView>
            </Modal>

            {/* Modal de confirmación de logout */}
            <Modal visible={confirmarLogout} transparent animationType="fade">
                <BlurView style={styles.blurView} intensity={40} tint={currentColors.blurStyle as any}>
                    <View style={[styles.modalContainer, { backgroundColor: currentColors.formTextArea }]}>
                        <Text style={[styles.modalHeaderText, { color: currentColors.formTextColor }]}>
                            ¿Seguro que quieres cerrar sesión?
                        </Text>
                        <View style={styles.modalBotones}>
                            <Pressable
                                style={[styles.modalBoton, { borderColor: currentColors.flatCardBorderColor }]}
                                onPress={() => setConfirmarLogout(false)}
                            >
                                <Text style={{ color: currentColors.formTextColor }}>Cancelar</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalBoton, { backgroundColor: currentColors.notificationsColor }]}
                                onPress={() => { setConfirmarLogout(false); logout(); }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Cerrar sesión</Text>
                            </Pressable>
                        </View>
                    </View>
                </BlurView>
            </Modal>

            <NavBar
                active="profile"
                solicitudes={solicitudes}
                valoraciones={valoraciones}
                home={'/homeInquilino'}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    main: { 
        flex: 1 
    },
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    scrollContent: { 
        padding: 20, 
        paddingTop: 50, 
        paddingBottom: 120, 
        gap: 28 
    },
    titulo: {
        fontSize: 26,
        fontWeight: 'bold'
    },
    nombreCompleto: {
        fontSize: 20,
        fontWeight: '600'
    },
    seccion: { 
        gap: 12 
    },
    tituloSeccion: { 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    label: { 
        fontSize: 13 
    },
    input: { 
        borderWidth: 1, 
        borderRadius: 10, 
        padding: 12, fontSize: 16 
    },
    textArea: { 
        height: 110, 
        textAlignVertical: 'top' 
    },
    chipsRow: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 8 
    },
    chip: { 
        paddingHorizontal: 14, 
        paddingVertical: 8, 
        borderRadius: 20, 
        borderWidth: 1 
    },
    botonGuardar: { 
        width: '100%', 
        padding: 16, 
        borderRadius: 12, 
        alignItems: 'center' 
    },
    textoBotonGuardar: { 
        color: '#fff', 
        fontWeight: '600', 
        fontSize: 16 
    },
    botonLogout: { 
        width: '100%', 
        padding: 14, 
        alignItems: 'center' ,
    },
    textoLogout: { 
        fontWeight: '600', 
        fontSize: 15 
    },
    blurView: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    modalContainer: { 
        width: '78%', 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderRadius: 13, 
        position: 'relative', 
        padding: 30, 
        gap: 16 
    },
    modalHeaderText: { 
        fontSize: 16, 
        fontWeight: '600', 
        textAlign: 'center'
    },
    closingIcon: { 
        position: 'absolute', 
        right: 5, 
        top: 5 
    },
    modalBotones: { 
        flexDirection: 'row', 
        gap: 12 
    },
    modalBoton: { 
        flex: 1, 
        padding: 12, 
        borderRadius: 10, 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: 'transparent' 
    },
    userImageContainer: {
        width: '100%',
        alignItems: 'center',
        gap: 10,
    },
    botonEditar: {
        padding: 10,
        borderRadius: 7,
        alignSelf: 'center'
    }
});
