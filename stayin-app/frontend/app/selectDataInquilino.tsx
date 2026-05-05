import { View, Image, useColorScheme, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from '@/constants/theme';
import { ToggleButtonRole } from "@/components/my-components/toggleButtonRole";
import { CustomForm } from "@/components/my-components/customForm";
import { FirstTextInput } from "@/components/my-components/firstTextInput";
import { MiddleTextInput } from "@/components/my-components/middleTextInput";
import { LastTextInput } from "@/components/my-components/lastTextInput";

export default function SelectStateInquilino() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const handleContinuar = () => {

    }
    return (
        <View style={[styles.main, {
            backgroundColor: currentColors.background
        }]}>
            <Image
                style={styles.logo}
                source={currentColors.imgSource2}
            />
            <CustomForm title="Continuar" onPress={handleContinuar}>
                <FirstTextInput>
                    
                </FirstTextInput>
            </CustomForm>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        display: "flex",
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        textAlign: "left",
        gap: 8,
        padding: 20,
        height: "100%",
        backgroundColor: "#000000"
    },
    logo: {
        height: 300,
        width: 300
    },

    buttonContinuar: {
        padding: 20,
        marginTop: "auto"
    }
})