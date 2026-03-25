import { ToggleButtonRole } from '@/components/my-components/toggleButtonRole';
import { Colors } from '@/constants/theme';
import { Image, StyleSheet, useColorScheme, View } from 'react-native';

export default function SelectRole() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    return (
        <View style={[styles.main, {
            backgroundColor: currentColors.background
        }]
        }>
            <Image
                style={styles.logo}
                source={currentColors.imgSource}
            />
            <View>
                    <ToggleButtonRole text1='Inquilino' text2='Casero'/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        display: "flex",
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        textAlign: "left",
        gap: 8,
        padding: 20
    },
    logo: {
        height: 300,
        width: 300
    },
})