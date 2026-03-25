import { CustomForm } from '@/components/my-components/customForm';
import { FirstTextInput } from '@/components/my-components/firstTextInput';
import { LastTextInput } from '@/components/my-components/lastTextInput';
import { Colors } from '@/constants/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';

export default function LoginScreen() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const router = useRouter();
    const [passwd1, setPasswd1] = useState('');
    const [passwd2, setPasswd2] = useState('');
    const handleContinuar = () => {
        console.log('Password capturada', passwd1);
        console.log('Password capturada', passwd2);

        if(passwd1 === '' || passwd2 === '' || passwd1 != passwd2) {
            console.log('Faltan datos o no son iguales!')
            return;
        }
        router.push('./selectRole')
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
                placeholder='Contraseña'
                secureTextEntry={true}
                value={passwd1}
                onChangeText={setPasswd1}
            />
            <LastTextInput
                placeholder='Repetir contraseña'
                secureTextEntry={true}
                value={passwd2}
                onChangeText={setPasswd2}
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