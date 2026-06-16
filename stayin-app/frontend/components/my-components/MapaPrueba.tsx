import React from 'react';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Colors } from "@/constants/theme";
import { router } from "expo-router";

export const MapaPrueba = () => {
  // Coordenadas de prueba centradas en la ETSIIT
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const testLocation = {
        latitude: 37.1970,
        longitude: -3.6244,
        latitudeDelta: 0.005, // Controla el zoom vertical
        longitudeDelta: 0.005, // Controla el zoom horizontal
    };

    return (
        <View style={[styles.container, {
            backgroundColor: currentColors.flatCardBackground
        }]}>            
            {/* El componente MapView debe tener dimensiones explícitas o flex */}
            <View style={styles.mapContainer}>
                <MapView
                style={styles.map}
                initialRegion={testLocation}
                showsUserLocation={true}
                >
                {/* El marcador que señala la vivienda */}
                <Marker
                    coordinate={{
                    latitude: testLocation.latitude,
                    longitude: testLocation.longitude,
                    }}
                    title="Piso disponible"
                    description="Calle de prueba, 123"
                    pinColor="purple" // Puedes personalizar el color del pin
                />
                </MapView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // backgroundColor: '#f5f5f5',
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        alignSelf: 'flex-start',
    },
    mapContainer: {
        width: '100%',
        height: 300, // Altura fija para que no colapse en móvil
        borderRadius: 15,
        overflow: 'hidden', // Asegura que las esquinas redondeadas apliquen al mapa
        elevation: 5, // Sombra en Android
        shadowColor: '#000', // Sombra en iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});