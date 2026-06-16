import { Colors } from "@/constants/theme";
import { Text, View, useColorScheme, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { router } from "expo-router";

export function PopUp({title, text}: {title: string, text: string}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    return (
        <Pressable 
            style={[styles.main, {
                backgroundColor: currentColors.background,
                borderColor: currentColors.flatCardBorderColor
                }
            ]}
            onPress={() => (router.push('/personalityTestBeginPage'))}
        >
            <View style={{gap: 5}}>
                <Text style={[styles.title, {
                    color: currentColors.formTextColor
                }]}>
                    {title}
                </Text>
                <Text style={[ styles.text, {
                    color: currentColors.flatCardBorderColor
                }]}>
                    {text}
                </Text>
            </View>
            <SimpleLineIcons name="arrow-right" size={18} color={currentColors.formTextColor} />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    main: {
        width: '80%',
        borderRadius: 100,
        position: 'absolute',
        top: 50,
        alignSelf: 'center',
        padding: 7,
        paddingHorizontal: 20,
        borderWidth: 1,
        gap: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    text: {
        fontSize: 12
    },
    title: {
        fontWeight: '600'
    }
})