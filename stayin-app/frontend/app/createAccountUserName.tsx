import { CustomForm } from '@/components/my-components/customForm';
import { FirstTextInput } from '@/components/my-components/firstTextInput';
import { Colors } from '@/constants/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';

export default function LoginScreen() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const handleContinuar = () => {
            console.log('Username capturado', userName)
    
            if (userName === '') {
                console.log('Faltan datos!')
                return
            }
            router.push('./createAccountPassword')
        }
  return (
    <View style={[styles.main, {
            backgroundColor: currentColors.background}]}>
        <Image
            style={styles.logo}
            source={currentColors.imgSource}
        />
        <CustomForm title='Continuar' onPress={handleContinuar}>
            <FirstTextInput
                placeholder='Nombre de usuario'
                value={userName}
                onChangeText={setUserName}
            />
        </CustomForm>
    </View>
  );
}

const styles = StyleSheet.create({
    main: {
        // backgroundColor: "#ffffff",
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
    }
})