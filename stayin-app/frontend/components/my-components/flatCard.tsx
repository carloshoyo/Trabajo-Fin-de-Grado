import { View, Image, StyleSheet, ImageSourcePropType, Text, useColorScheme } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export function FlatCard({title, img, direccion, precio}: {title: string, img: ImageSourcePropType, direccion: string, precio: number}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    return (
        <View style={[styles.card, {
            backgroundColor: currentColors.flatCardBackground,
            borderColor: currentColors.flatCardBorderColor
        }]}>
            <Image
                style={[styles.img]}
                source={img}
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
                <View style={[styles.viewIcons]}>
                    <Ionicons name="chatbox-outline" size={24} color={currentColors.formButtonColor}/>
                    <MaterialCommunityIcons name="cards-heart-outline" size={24} color={currentColors.formButtonColor}/>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 13,
        borderWidth: 3
    },
    img: {
        width: '100%',
        height: 250,
        borderTopLeftRadius: 11,
        borderTopRightRadius: 11
    },
    viewIcons: {
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10
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