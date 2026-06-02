import { View, Image, StyleSheet, ImageSourcePropType, Text, useColorScheme, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export function UserCard({name, scoring, img}: {name: string, scoring: number, img?: ImageSourcePropType}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    return (
        <View style={[styles.main, {
            backgroundColor: currentColors.formTextArea,
            borderColor: currentColors.flatCardBorderColor
        }]}>
            <View style={[styles.userImgContainer, {
                backgroundColor: currentColors.formTextArea
            }]}>
                {img ? (
                    <Image
                        style={styles.userImg}
                        source={img}
                    />
                ) : (
                    <FontAwesome5 name="user-circle" size={96} color={currentColors.formBorderColor}/>
                )}
            </View>
            <View style={[styles.textContainer]}>
                
                <View style={[styles.scoringContainer, {
                    backgroundColor: scoring >= 80 
                            ? currentColors.highScoringColorContainer
                                : scoring < 80 && scoring >= 50 
                                    ? currentColors.midScoringColorContainer
                                    : currentColors.lowScoringColorContainer
                }]}>
                    <Text style={{
                        color: scoring >= 80 
                            ? currentColors.highScoringColorText 
                                : scoring < 80 && scoring >= 50 
                                    ? currentColors.midScoringColorText
                                    : currentColors.lowScoringColorText
                    }}>
                        {`${scoring}%`}
                    </Text>
                </View>
                <Text style={[styles.nameStyle, {
                    color: currentColors.formTextColor
                }]}>
                    {name}
                </Text>
            </View>
            <TouchableOpacity style={[styles.contactButton, {
                backgroundColor: currentColors.formButtonColor
            }]}>
                <Text style={{
                    color: currentColors.formTextArea
                }}>
                    Contactar
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        width: 220,
        alignItems: 'center',
        padding: 10,
        borderRadius: 13,
        gap: 10,
        borderWidth: 1
    },
    userImgContainer: {
        borderRadius: 1000
    },
    userImg: {
    },
    contactButton: {
        padding: 5,
        borderRadius: 5
    },
    textContainer: {
        gap: 5,
        alignItems: 'center'
    },
    nameStyle: {
        fontWeight: '600'
    },
    scoringContainer: {
        padding: 2,
        paddingHorizontal: 4,
        borderRadius: 7
    }
})