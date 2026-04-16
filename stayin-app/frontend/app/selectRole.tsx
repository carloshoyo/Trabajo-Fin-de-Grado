import { ToggleButtonRole } from '@/components/my-components/toggleButtonRole';
import { Colors } from '@/constants/theme';
import { Image, StyleSheet, TouchableOpacity, useColorScheme, View, Text } from 'react-native';
import { useRegistration } from '@/context/RegistrationContext';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { CustomForm } from '@/components/my-components/customForm';
import { API_CONFIG } from '@/constants/config';

export default function SelectRole() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const [selectedRole, setSelectedRole] = useState<string>('');
    const router = useRouter();
    const { updateData, registrationData } = useRegistration();
    const onRoleSelected = (role: string) => {
        setSelectedRole(role);
    }
    const handleContinuar = async () => {
        if(selectedRole === '') {
            console.log('Tienes que seleccionar un rol.')
            return
        }
        console.log('Rol seleccionado: ', selectedRole);
        updateData({rol: selectedRole});
        if(await enviarDatos()) {
            if(selectedRole === 'Inquilino')     {
                router.push('./selectDataInquilino');
            }
            router.push('./homeCasero')
        }
    }

    const enviarDatos = async () => {
        try {
            const respuesta = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.register}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: registrationData.name,
                    apellidos: registrationData.apellidos,
                    email: registrationData.email,
                    username: registrationData.username,
                    birth_date: registrationData.date,
                    gender: registrationData.gender,
                    password: registrationData.password,
                    rol: selectedRole
                }),
            });
            const resultado = await respuesta.json();
            console.log('Respuesta: ', resultado);
            return true;
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    }

    return (
        <View style={[styles.main, {
            backgroundColor: currentColors.background
        }]}>
            <Image
                style={styles.logo}
                source={currentColors.imgSource2}
            />
            {/* <CustomForm title='Continuar' onPress={handleContinuar}> */}
                <ToggleButtonRole text1='Inquilino' text2='Casero' value={selectedRole} onRoleSelected={onRoleSelected}></ToggleButtonRole>
                <Text>
                </Text>
                <TouchableOpacity>
                    <Text style={[styles.buttonContinuar, {
                        backgroundColor: currentColors.formButtonColor,
                        color: currentColors.formTextArea
                    }]}
                    onPress={handleContinuar}>
                        Continuar
                    </Text>
                </TouchableOpacity>
            {/* </CustomForm> */}
            
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
        padding: 20,
        height: "100%",
        backgroundColor: "#000000"
    },
    logo: {
        height: 94,
        width: 200
    },

    buttonContinuar: {
        padding: 20,
        marginTop: "auto",
        fontWeight: 'bold',
        borderRadius: 8
    }
})