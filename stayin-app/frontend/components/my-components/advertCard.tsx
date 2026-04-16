import { View, Image, StyleSheet, ImageSourcePropType, Text, useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

export function AdvertCard({title, img, direccion, precio}: {title: string, img: string, direccion: string, precio: number}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    return (
        <View style={[styles.card, {
            backgroundColor: currentColors.flatCardBackground,
            borderColor: currentColors.flatCardBorderColor
        }]}>
            <Image
                style={[styles.img]}
                source={require('../../assets/images/flat_img.png')}
                resizeMode="cover"
            />
            <View style={[styles.flatInfo]}>
                <Text style={[styles.title, {
                    color: currentColors.formTextColor
                }]}>
                    {title}
                </Text>
                <Text style={[styles.direccion, {
                    color: currentColors.formTextColor
                }]}>
                    {direccion}
                </Text>
                <Text style={[styles.precio, {
                    color: currentColors.formTextColor
                }]}>
                    {precio}€/mes
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 13,
        borderWidth: 3,
        width: '100%'
    },
    img: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 11,
        borderTopRightRadius: 11
    },
    flatInfo: {
        padding: 10,
        gap: 5
    },
    title: {
        fontSize: 24,
        fontWeight: '400'
    },
    direccion: {
        fontSize: 16
    },
    precio: {
        fontSize: 28,
        fontWeight: 'bold'
    }
})