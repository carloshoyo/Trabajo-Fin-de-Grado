import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

export function ToggleButtonRole({text1, text2, value, onRoleSelected}: {text1: string, text2: string, value: string, onRoleSelected: (role: string) => void}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const router = useRouter();
    return (
        <View style={[styles.box, {
            backgroundColor: currentColors.formButtonColor,
        }]}>
            <TouchableOpacity style={[styles.button, {
                backgroundColor: value === 'inquilino'
                ? currentColors.formBorderColor
                : currentColors.formTextArea,
                
            }]}
            onPress={() => onRoleSelected('inquilino')}>
                <Text style={{color: currentColors.formTextColor}} >{text1}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, {
                backgroundColor: value === 'casero'
                ? currentColors.formBorderColor
                : currentColors.formTextArea
            }]}
            onPress={() => onRoleSelected('casero')}>
                <Text style={{color: currentColors.formTextColor}}>{text2}</Text>
            </TouchableOpacity>
        </View>
        
    )
}

const styles = StyleSheet.create({
    main: {
        display: "flex",
        flexDirection: "column",
        gap: 50,
    },
    box: {
        borderRadius: 100,
        display: "flex",
        flexDirection: "row",
        gap:8,
        padding: 4
    },
    button: {
        borderRadius: 100,
        padding: 10,
        minWidth: 80,
        alignItems: "center"
    },
    roleButtons: {
        display: "flex",
        flexDirection: "row"
    }
})

const descInquilino= 'Inquilino';
const descCasero = 'Casero';