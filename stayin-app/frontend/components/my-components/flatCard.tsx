// import { View, Image, StyleSheet, ImageSourcePropType, Text, useColorScheme, Pressable } from "react-native";
// import { Ionicons } from '@expo/vector-icons';
// import { Colors } from "@/constants/theme";
// import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// import { router } from "expo-router";

// export function FlatCard({title, img, direccion, precio, descripcion, area, max_inquilinos, id_anuncio}: {title: string, img: ImageSourcePropType, direccion: string, precio: number, descripcion: string, area: number, max_inquilinos: number, id_anuncio: number}) {
//     const theme = useColorScheme() ?? 'light';
//     const currentColors = Colors[theme];
//     const handlePress = () => {
//         router.push('/adViewInquilino');
//     }
//     return (
//         <Pressable 
//             style={[styles.card, {
//                 backgroundColor: currentColors.flatCardBackground,
//                 borderColor: currentColors.flatCardBorderColor
//             }]}
//             onPress={handlePress}
//         >
//             <Image
//                 style={[styles.img]}
//                 source={img}
//                 resizeMode="cover"
//             />
//             <View style={[styles.flatInfo]}>
//                 <Text style={[styles.title, {
//                     color: currentColors.formTextColor
//                 }]}>
//                     {title}
//                 </Text>
//                 <Text style={[styles.direccion, {
//                     color: currentColors.formTextColor
//                 }]}>
//                     {direccion}
//                 </Text>
//                 <Text>
//                     {}
//                 </Text>
//                 <Text style={[styles.precio, {
//                     color: currentColors.formTextColor
//                 }]}>
//                     {precio}€/mes
//                 </Text>
//                 <View style={[styles.viewIcons]}>
//                     <Ionicons name="chatbox-outline" size={24} color={currentColors.formButtonColor}/>
//                     <MaterialCommunityIcons name="cards-heart-outline" size={24} color={currentColors.formButtonColor}/>
//                 </View>
//             </View>
//         </Pressable>
//     )
// }

// const styles = StyleSheet.create({
//     card: {
//         borderRadius: 13,
//         borderWidth: 3
//     },
//     img: {
//         width: '100%',
//         height: 250,
//         borderTopLeftRadius: 11,
//         borderTopRightRadius: 11
//     },
//     viewIcons: {
//         display: 'flex',
//         width: '100%',
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         padding: 10
//     },
//     flatInfo: {
//         padding: 10,
//         gap: 5
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: '400'
//     },
//     direccion: {
//         fontSize: 16
//     },
//     precio: {
//         fontSize: 28,
//         fontWeight: 'bold'
//     }
// })

import { View, Image, StyleSheet, ImageSourcePropType, Text, useColorScheme, Pressable } from "react-native";
import { Colors } from "@/constants/theme";
import { router } from "expo-router";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from "@expo/vector-icons";

export function FlatCard({title, img, direccion, precio, descripcion, area, max_inquilinos, id_anuncio}: {title: string, img: string, direccion: string, precio: number, descripcion: string, area: number, max_inquilinos: number, id_anuncio: number}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const handleContinuar = () => {
        router.push({
            pathname: '/adViewInquilino',
            params: {title: title, img: img, direccion: direccion, precio: precio, descripcion: descripcion, area: area, max_inquilinos: max_inquilinos, id_anuncio: id_anuncio}

        });
    }
    return (
        <Pressable 
            style={[styles.card, {
                backgroundColor: currentColors.flatCardBackground,
                borderColor: currentColors.flatCardBorderColor
            }]}
            onPress={handleContinuar}
        >
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
                <View style={[styles.infoPiso]}>
                    <Text style={[styles.direccion, {
                        color: currentColors.formTextColor
                    }]}>
                        {area} m²
                    </Text>
                    <Text style={{
                        fontWeight: 'bold',
                        color: currentColors.formTextColor
                    }}>
                        {max_inquilinos} x <FontAwesome6 name="person" size={14} color={currentColors.formTextColor} />
                        {/* 4 x <Ionicons name="body-outline" size={14} color={currentColors.formTextColor} /> */}
                    </Text>
                </View>
                <View style={[styles.viewIcons]}>
                    <Ionicons name="chatbox-outline" size={24} color={currentColors.formButtonColor}/>
                    <MaterialCommunityIcons name="cards-heart-outline" size={24} color={currentColors.formButtonColor}/>
                </View>       
            </View>
        </Pressable>
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
    },
    infoPiso: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center'
    },
    viewIcons: {
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10
    },
})