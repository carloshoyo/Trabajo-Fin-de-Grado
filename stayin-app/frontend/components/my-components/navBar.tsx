import { View, StyleSheet, Text, useColorScheme, Pressable } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Href, RelativePathString, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useLogin } from "@/context/LoginContext";

export function NavBar({active, solicitudes, valoraciones, home}: {active: string, solicitudes?: number, valoraciones: number, home: Href}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const router = useRouter();
    const { loginData } = useLogin();
    const navigateHome = () => {
        if (loginData?.rol === 'Casero') {
            router.replace('/homeCasero' as Href);
        } else {
            router.replace('/homeInquilino' as Href);
        }
    }
    const moveTo = (screen: RelativePathString) => {
        router.replace(screen);
    }          
        
    return (
        <View style={[styles.main, {
            backgroundColor: currentColors.background
        }]}>
            <View style={[styles.nav, {
                borderColor: currentColors.navBorderColor,
                backgroundColor: currentColors.background
            }]}>
                <Pressable style={[styles.pressables]} onPress={() => navigateHome()}>
                    <Ionicons name={active==='home' ? "home" : "home-outline"} size={24} color={currentColors.formButtonColor}/>
                </Pressable>
                <Pressable style={[styles.pressables]}>
                    <MaterialIcons name="search" size={24} color={currentColors.formButtonColor}/>
                </Pressable>
                <Pressable style={[styles.pressables]}>
                    <Ionicons name="chatbox-outline" size={24} color={currentColors.formButtonColor}/>
                </Pressable>
                
                <View style={[styles.notifications]}>
                    {solicitudes + valoraciones > 0 ? (
                    <View style={[styles.notificationsNumberView, {
                        backgroundColor: currentColors.notificationsColor
                    }]}>
                        <Text style={[styles.notificationsNumber, {
                            color: '#fff'
                        }]}>
                            {solicitudes + valoraciones}
                        </Text>
                    </View>
                    ) : (
                        <></>
                    )}
                    <Pressable style={[styles.pressables]} onPress={() => moveTo('/screenSocial')}>
                        <MaterialCommunityIcons name={active === 'social' ? "cards-heart" : "cards-heart-outline"} size={24} color={currentColors.formButtonColor}/>
                    </Pressable>
                </View>
                <Pressable style={[styles.pressables]}>
                    <FontAwesome5 name="user-circle" size={24} color={currentColors.formButtonColor}/>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        position: 'absolute',
        bottom: 0,
    },
    nav: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        padding: 15,
        paddingBottom: 25,
        borderTopWidth: .5
    },
    notifications: {
        position: 'relative'
    },
    notificationsNumberView: {
        position: 'absolute',
        zIndex: 10,
        borderRadius: 100,
        padding: 1,
        justifyContent: 'center',
        alignItems: 'center',
        right: -8,
        top: -5,
        minWidth: 16,
        height: 16,
        paddingHorizontal: 4
    },
    notificationsNumber: {
        fontSize: 10,
        fontWeight: 'bold'
    },
    pressables: {
        padding: 5
    }
})