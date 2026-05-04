import { Colors } from "@/constants/theme";
import { View, StyleSheet, Text, useColorScheme, Pressable, ScrollView } from "react-native";
import { SolicitudRegistroVivienda } from "@/components/my-components/solicitudRegistroVivienda";

export default function ScreenSocial() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    return(
        <ScrollView 
            style={[styles.scrollArea, {
                backgroundColor: currentColors.background
            }]}
            contentContainerStyle={[styles.scrollContainer]}
        >
            <Text style={[styles.title, {
                color: currentColors.formTextColor
            }]}>
                Solicitudes pendientes
            </Text>
            <SolicitudRegistroVivienda username="Carlos Hoyo" title="Gran Vía, 13"/>

        </ScrollView>
    )
};

const styles = StyleSheet.create({
    scrollArea: {
        flex: 1
    },
    scrollContainer: {
        padding: 10,
        paddingTop: 80,
        gap: 50,
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: '400'
    }
})