import { CreateAccountButton } from '@/components/my-components/createAccountButton';
import { CustomForm } from '@/components/my-components/customForm';
import { FirstTextInput } from '@/components/my-components/firstTextInput';
import { LastTextInput } from '@/components/my-components/lastTextInput';
import { Colors } from '@/constants/theme';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useLogin } from '@/context/LoginContext';
import { API_CONFIG } from '@/constants/config';

export default function LoginScreen() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const [email, setEmail] = useState('');
    const [passwd, setPasswd] = useState('');
    const [rol, setRole] = useState('');
    const {updateData, loginData} = useLogin();
    const handleContinuar = async () => {
        console.log('Email capturado', email)
        console.log('Password capturada', passwd)

        if (email === '' || passwd === '') {
            console.log('Faltan datos!')
            return
        }
        updateData({ userName: email, password: passwd });
        const rolDevuelto = await enviarDatos();
        console.log("Rol devuelto: ", rolDevuelto);
        if(rolDevuelto != undefined) {
            if(rolDevuelto==='Inquilino') {
                router.push('./homeInquilino');
            } else if(rolDevuelto === 'Casero'){
                router.push('./homeCasero');
            } else {
                console.log('Rol no definido en el sistema.');
            }
        }
    }
    const enviarDatos = async () => {
        try {
            console.log("MI IP ACTUAL ES: ", API_CONFIG.baseUrl);
            const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userName: email,
                    password: passwd
                }),
            });
            const resultado = await respuesta.json();
            if(resultado.success === true) {
                setRole(resultado.userData.rol);
                console.log('El rol del resultado es: ')
                console.log(resultado.userData.rol);
                return resultado.userData.rol;
            } else {
                console.log('Respuesta: ', resultado);
                return false;
            }
        } catch(error) {
            console.error('Error:', error);
            return false;
        }
    }
  return (
    <View style={[styles.main, {
            backgroundColor: currentColors.background}]}>
        <Image
            style={styles.logo}
            source={currentColors.imgSource}
        />
        <CustomForm title='Iniciar sesión' onPress={handleContinuar}>
            <FirstTextInput 
                placeholder='Nombre de usuario, email o teléfono' 
                autoCapitalize='none' 
                keyboardType='email-address' 
                secureTextEntry={false}
                value={email}
                onChangeText={setEmail}
            />
            <LastTextInput
                placeholder='Contraseña'
                autoCapitalize='none' 
                keyboardType='default' 
                secureTextEntry={true}
                value={passwd}
                onChangeText={setPasswd}
            />
        </CustomForm>        
        <Link href='./forgotPassword' asChild>
            <TouchableOpacity>
                <Text style={[styles.forgot, {
                    color: currentColors.formTextColor
                }]}>¿Has olvidado tu contraseña?</Text>
            </TouchableOpacity>        
        </Link>
        <CreateAccountButton/>
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
    },
    formBox: {
        width: "100%",
    },
    form1: {
        backgroundColor: "#E6E6E6",
        padding: 20,
        borderWidth: 6,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomWidth: 2,
        borderColor: "#999999",
        fontWeight: "bold"
    },
    form2: {
        backgroundColor: "#E6E6E6",
        padding: 20,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderColor: "#999999",
        fontWeight: "bold"
    },
    submitButton: {
        backgroundColor: "#4D4D4D",
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        padding: 20,
    },
    submitButtonText: {
        fontWeight: 'bold',
        textAlign: "center",
        fontSize: 20,
        width: "100%",
        color: "#ffffff"
    },
    forgot: {
        fontSize: 16,
        marginTop: 6
    }
})