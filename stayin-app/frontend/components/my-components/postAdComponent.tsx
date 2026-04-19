import { View, Text, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';

export function PostAdComponent() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const handlePress = () => {
        router.push('/postAd');
    }
    return (
        <Pressable style={[styles.pressable]}
            onPress={handlePress}
        >
            <View style={[styles.main, {
                backgroundColor: currentColors.postAdContainerColor
            }]}>
                <View style={[styles.masContainer, {
                    backgroundColor: currentColors.formBorderColor
                }]}>
                    <Text style={[styles.masText, {
                        color: currentColors.postAdTextColor
                    }]}>
                        +
                    </Text>
                </View>
                <Text style={[styles.nuevoText, {
                    color: currentColors.postAdTextColor
                }]}>
                    Nuevo anuncio
                </Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    main: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        gap: 6,
        borderRadius: 13
    },
    pressable: {
        width: '75%',
        height: 110
    },
    masContainer: {
        display: 'flex',
        borderRadius: 1000,
        opacity: 44,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    masText: {
        fontSize: 32
    },
    nuevoText: {
        fontSize: 16,
        fontWeight: 'bold'
    }
})