import { View, StyleSheet, Text, useColorScheme } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export function NavBar({active}: {active: string}) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    return (
        <View style={[styles.main, {
            backgroundColor: currentColors.background
        }]}>
            <View style={[styles.nav, {
                borderColor: currentColors.navBorderColor,
                backgroundColor: currentColors.background
            }]}>
                <Ionicons name={active==='home' ? "home" : "home-outline"} size={24} color={currentColors.formButtonColor}/>
                <MaterialIcons name="search" size={24} color={currentColors.formButtonColor}/>
                <Ionicons name="chatbox-outline" size={24} color={currentColors.formButtonColor}/>
                <MaterialCommunityIcons name="cards-heart-outline" size={24} color={currentColors.formButtonColor}/>
                <FontAwesome5 name="user-circle" size={24} color={currentColors.formButtonColor}/>
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
        paddingBottom: 30,
        borderTopWidth: .5
    }
})