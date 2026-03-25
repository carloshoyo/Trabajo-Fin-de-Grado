import { Colors } from "@/constants/theme";
import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, useColorScheme } from "react-native";

export function CreateAccountButton() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    return (
        <Link href='./createAccountUserName' asChild >
            <TouchableOpacity 
            style={StyleSheet.flatten([styles.nuevaCuenta, {
                backgroundColor: currentColors.formTextArea,
                borderColor: currentColors.formBorderColor,
                marginTop: "auto"
            }])}>
                <Text style={[{color: currentColors.formTextColor}]}>¿No tienes cuenta? Crea una</Text>
            </TouchableOpacity>
        </Link>
    )
}

const styles = StyleSheet.create({
    nuevaCuenta: {
        backgroundColor: "#E6E6E6",
        borderRadius: 50,
        padding: 14,
        borderWidth: 1,
        borderColor: "#999999",
        color: "#333333"
    },
})