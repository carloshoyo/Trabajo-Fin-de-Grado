import { Colors } from "@/constants/theme";
import { View, StyleSheet, Text, useColorScheme, Pressable, ImageSourcePropType, Image } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { router } from "expo-router";

export function RatingCard({img, usuario_a_valorar, title, id_valorado, id_estancia}: {img: ImageSourcePropType, usuario_a_valorar: string, title: string, id_valorado: number, id_estancia: number}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const handlePress = () => {
        router.push({
            pathname: '/ratingScreen',
            params: {usuario_a_valorar: usuario_a_valorar, title: title, id_valorado: id_valorado, id_estancia: id_estancia}
        });
    }
    return (
        <View style={[styles.main, {
            backgroundColor: currentColors.formTextArea,
            borderColor: currentColors.flatCardBorderColor
        }]}>
            <View style={[styles.content]}>
                {img ? (
                    <Image
                        style={styles.userImg}
                        source={img}
                    />
                ) : (
                    <FontAwesome5 name="user-circle" size={60} color={currentColors.formButtonColor}/>
                )}
                <View style={[styles.data]}>
                    <Text style={[styles.dataTextUser, {
                        color: currentColors.formTextColor
                    }]}>
                        {usuario_a_valorar}
                    </Text>
                    <Text style={[styles.dataTextAd, {
                        color: currentColors.formTextColor
                    }]}>
                        {title}
                    </Text>
                </View>
            </View>
            <Pressable 
                style={[styles.pressable, {
                    backgroundColor: currentColors.formButtonColor
                }]}
                onPress={handlePress}
            >
                <Text style={[styles.dataTextAd, {
                    color: currentColors.formTextArea
                }]}>
                    Valorar
                </Text> 
            </Pressable>                     
        </View>
    )
};

const styles = StyleSheet.create({
    main: {
        width: '100%',
        height: 100,
        borderRadius: 13,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10
    },
    content: {
        flex: 1,        
        flexDirection: 'row',
        gap: 30
    },
    userImg: {

    },
    data: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10
    },
    dataTextUser: {
        fontSize: 16,
        fontWeight: '500'
    },
    dataTextAd: {
        fontSize: 18,
        fontWeight: '500'
    },
    pressable: {
        padding: 10,
        borderRadius: 7,
    }
})