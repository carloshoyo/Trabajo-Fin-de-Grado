import { Text, View, useColorScheme, StyleSheet, ScrollView } from "react-native";
import { FlatCard } from "@/components/my-components/flatCard";
import { Colors } from "@/constants/theme";
import { NavBar } from "@/components/my-components/navBar";
import { UserCard } from "@/components/my-components/userCard";

export default function HomeInquilino() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    return (
        <View style={[styles.container, {
            backgroundColor: currentColors.background
        }]}>
            <ScrollView
                style={[styles.scrollArea]}
                contentContainerStyle={[styles.scrollContent, {
                    backgroundColor: currentColors.background
                }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.title, {
                    color: currentColors.formTextColor,
                    marginTop: 70
                }]}>
                    Viviendas que te podrían interesar
                </Text>
                <FlatCard 
                    title="Piso en Gran Vía"
                    img={require('../assets/images/flat_img.png')}
                    direccion="Gran Vía de Colón, 13, Granada"
                    precio={350}
                />
                <Text style={[styles.title]}>
                    Posibles futuros compañeros
                </Text>
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[styles.carrusel]}
                >
                    <UserCard name="Carlos Hoyo" descripcion="Granada"></UserCard>
                    <UserCard name="Carlos Hoyo" descripcion="Granada"></UserCard>
                    <UserCard name="Carlos Hoyo" descripcion="Granada"></UserCard>
                </ScrollView>
            </ScrollView>
            <NavBar active="home"></NavBar>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        display: 'flex',
        flex: 1,
        padding: 10,
        gap: 20,
        position: 'relative'
    },
    scrollArea: {
        flex: 1
    },
    scrollContent: {
        padding: 10,
        gap: 20,
        position: 'relative',
        paddingBottom: 120
    },
    title: {
        fontSize: 24,
        fontWeight: '400'
    },
    container: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    carrusel: {
        gap: 15
    }
})