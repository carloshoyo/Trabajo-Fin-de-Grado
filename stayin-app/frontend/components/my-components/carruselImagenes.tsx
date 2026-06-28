import { useState } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Ionicons from '@expo/vector-icons/Ionicons';
import { API_CONFIG } from "@/constants/config";

const PLACEHOLDER = require('../../assets/images/flat_img.png');

// Convierte una ruta guardada en BD a una URL cargable.
// - /uploads/... -> se le antepone la base actual (independiente de la IP)
// - http(s)://... -> se usa tal cual (compatibilidad con datos antiguos)
// - file://...    -> ruta local (anuncios antiguos); solo cargará en el mismo dispositivo
export function resolverUri(uri: string): string {
    if (!uri) return uri;
    if (uri.startsWith('/')) return `${API_CONFIG.baseUrl}${uri}`;
    return uri;
}

// Aplana el objeto multimedia ({salon:[], cocina:[], ...}) + la portada en una lista de URIs.
export function aplanarMultimedia(multimedia: any, portada?: string): string[] {
    const uris: string[] = [];
    if (portada) uris.push(portada);

    // multimedia puede venir como objeto (backend Node) o como string JSON (motor de recomendación)
    if (typeof multimedia === 'string') {
        try {
            multimedia = JSON.parse(multimedia);
        } catch {
            multimedia = null;
        }
    }

    if (multimedia && typeof multimedia === 'object') {
        const orden = ['salon', 'cocina', 'dormitorio', 'bano', 'extras'];
        for (const sala of orden) {
            if (Array.isArray(multimedia[sala])) uris.push(...multimedia[sala]);
        }
        // Por si hubiese categorías no contempladas en el orden anterior
        for (const clave of Object.keys(multimedia)) {
            if (!orden.includes(clave) && Array.isArray(multimedia[clave])) {
                uris.push(...multimedia[clave]);
            }
        }
    }

    // Eliminamos duplicados (la portada puede repetirse dentro de multimedia)
    return [...new Set(uris.filter(Boolean))];
}

export function CarruselImagenes({ imagenes, style }: { imagenes: string[]; style?: any }) {
    const [indice, setIndice] = useState(0);
    const [fallos, setFallos] = useState<Record<number, boolean>>({});

    const hayImagenes = imagenes && imagenes.length > 0;
    const total = hayImagenes ? imagenes.length : 1;

    const anterior = () => setIndice(i => (i - 1 + total) % total);
    const siguiente = () => setIndice(i => (i + 1) % total);

    const uriActual = hayImagenes ? imagenes[indice] : null;
    const source = (uriActual && !fallos[indice]) ? { uri: resolverUri(uriActual) } : PLACEHOLDER;

    return (
        <View style={[styles.container, style]}>
            <Image
                style={styles.img}
                source={source}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
                onError={() => setFallos(prev => ({ ...prev, [indice]: true }))}
            />

            {total > 1 && (
                <>
                    <Pressable style={[styles.flecha, styles.flechaIzq]} onPress={anterior} hitSlop={12}>
                        <Ionicons name="chevron-back" size={26} color="#fff" />
                    </Pressable>
                    <Pressable style={[styles.flecha, styles.flechaDer]} onPress={siguiente} hitSlop={12}>
                        <Ionicons name="chevron-forward" size={26} color="#fff" />
                    </Pressable>
                    <View style={styles.contador}>
                        <Text style={styles.contadorTexto}>{indice + 1} / {total}</Text>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 200,
        position: 'relative',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    img: {
        width: '100%',
        height: '100%',
    },
    flecha: {
        position: 'absolute',
        top: '50%',
        marginTop: -20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flechaIzq: { left: 10 },
    flechaDer: { right: 10 },
    contador: {
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.45)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    contadorTexto: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});
