import { Colors } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { View, StyleSheet, Text, useColorScheme, Image, ImageSourcePropType, Pressable } from "react-native";
import EvilIcons from '@expo/vector-icons/EvilIcons';


export function SolicitudRegistroVivienda({img, username, title}: {img?: ImageSourcePropType, username: string, title: string}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    return (
        <View style={[styles.main]}>
            <View style={[styles.solicitudCard, {
                    backgroundColor: currentColors.formTextArea
                }]}>
                <View style={[styles.userData]}> 
                    {img ? (
                        <Image
                            source={img}
                        />
                    ) : (
                        <FontAwesome5 name="user-circle" size={64} color={currentColors.formButtonColor}/>
                    )}
                    <View style={{alignItems: 'center'}}>
                        <Text style={[styles.username, {
                            color: currentColors.formButtonColor
                        }]}>
                            {username}
                        </Text>
                        <Text style={[styles.direccion, {
                            color: currentColors.formButtonColor
                        }]}>
                            {title}
                        </Text>
                    </View>
                </View>
                <View style={[styles.decision]}>
                    <Pressable>
                        <EvilIcons name="check" size={48} color={currentColors.acceptRequest} />
                    </Pressable>
                    <Pressable>
                        <EvilIcons name="close-o" size={48} color={currentColors.declineRequest} />
                    </Pressable>
                </View>
            </View>            
        </View>
    )
};

const styles = StyleSheet.create({
    main: {
        width: '100%'
    },
    solicitudCard: {
        flexDirection: 'row',
        borderRadius: 13,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'space-between'        
    },
    username: {
        fontSize: 18,
        fontWeight: '500'
    },
    direccion: {
        fontSize: 20,
        fontWeight: '600'
    },
    userData: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center',
    },
    decision: {
        flexDirection: 'row'
    }
})