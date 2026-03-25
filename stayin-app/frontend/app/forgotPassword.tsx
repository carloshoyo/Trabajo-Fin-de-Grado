import { CreateAccountButton } from '@/components/my-components/createAccountButton';
import { Colors } from '@/constants/theme';
import { Image } from 'expo-image';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';

export default function LoginScreen() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
  return (
    <View style={[styles.main, {
            backgroundColor: currentColors.background}]}>
        <Image
            style={styles.logo}
            source={currentColors.imgSource}
        />

        <View style={styles.formBox}>
            <TextInput
                style={[styles.form1, {
                    borderColor: currentColors.formBorderColor,
                    backgroundColor: currentColors.formTextArea,
                    color: currentColors.formTextColor
                }]}
                placeholder='Correo electrónico'
                placeholderTextColor={currentColors.formTextColor}
                autoCapitalize='none'
                keyboardType='email-address'
            />
            <TouchableOpacity 
            style={[styles.submitButton,{
                backgroundColor: currentColors.formButtonColor
            }]}>
                <Text style={[styles.submitButtonText, {
                    color: currentColors.background
                }]}>
                    Enviar correo
                </Text>
            </TouchableOpacity>
        </View>
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
        padding: 16,
        borderWidth: 6,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomWidth: 0,
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
    },
    nuevaCuenta: {
        marginTop: "auto",
        backgroundColor: "#E6E6E6",
        borderRadius: 50,
        padding: 14,
        borderWidth: 1,
        borderColor: "#999999",
        color: "#333333"
    }
})