import { Colors } from "@/constants/theme";
import { CurrentRenderContext } from "@react-navigation/native";
import { router } from "expo-router";
import { Text, View, useColorScheme, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";

export default function PersonalityTextBeginPage() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];

    return (
        <View 
            style={[styles.scrollContainer, {
                backgroundColor: currentColors.background
            }]}
            // contentContainerStyle={[styles.scrollContainer, {
            //         backgroundColor: currentColors.background
            // }]}
        >
            <Text style={[styles.title, {
                color: currentColors.formTextColor
            }]}>
                Test de personalidad 
            </Text>
            <Text style={[styles.text, {
                color: currentColors.flatCardBorderColor
            }]}>
                Responder a estas preguntas hará tu perfil más atractivo para otros usuarios.
            </Text>
            <Text style={[styles.text, {
                color: currentColors.flatCardBorderColor
            }]}>
                Trata de responder de manera sincera, no te llevará más de 1 minuto
            </Text>
            <Pressable 
                style={[styles.beginButton, {
                    backgroundColor: currentColors.formButtonColor
                }]}
                onPress={() => router.push('/personalityTest')}
            >
                <Text style={[styles.beginButtonText, {
                    color: currentColors.formTextArea
                }]}>
                    Comenzar test
                </Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        alignItems: 'center',
        gap: 15,
        padding: 10,
        paddingHorizontal: 20,
        paddingBottom: 120,
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '600'
    },
    text: {
    },
    beginButton: {
        padding: 10,
        borderRadius: 18,
        marginTop: 'auto',
    },
    beginButtonText: {
        fontSize: 16,
        fontWeight: '600',
        padding: 5
    }
})