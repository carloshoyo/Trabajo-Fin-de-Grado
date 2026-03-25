import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

export function ToggleButtonRole({text1, text2}: {text1: string, text2: string}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const router = useRouter();
    const handleContinuar = () => {
        if(selectedRole === null) {
            Alert.alert('Atención.', 'Por favor selecciona un rol para continuar.');
            return;
        }

        console.log('Rol elegido', selectedRole);
        router.push('./')
    }
    return (
        <View style={[styles.main, {
        }]}>
            <View style={[styles.box, {
                backgroundColor: currentColors.formButtonColor,
            }]}>
                <TouchableOpacity style={[styles.button, {
                    backgroundColor: selectedRole === 'inquilino'
                    ? currentColors.formBorderColor
                    : currentColors.formTextArea
                }]}
                onPress={() => setSelectedRole('inquilino')}>
                    <Text>Inquilino</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, {
                    backgroundColor: selectedRole === 'casero'
                    ? currentColors.formBorderColor
                    : currentColors.formTextArea
                }]}
                onPress={() => setSelectedRole('casero')}>
                    <Text>Casero</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity>
                <Text style={[{
                    backgroundColor: currentColors.formButtonColor
                }]}
                onPress={handleContinuar}>
                    Continuar
                </Text>
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