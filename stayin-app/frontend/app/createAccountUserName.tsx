import { CustomForm } from '@/components/my-components/customForm';
import { FirstTextInput } from '@/components/my-components/firstTextInput';
import { MiddleTextInput } from '@/components/my-components/middleTextInput';
import { Colors } from '@/constants/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View, useColorScheme, Pressable, Platform } from 'react-native';
import { useRegistration } from '@/context/RegistrationContext';
import DateTimePicker from "@react-native-community/datetimepicker";
import { LastTextInput } from '@/components/my-components/lastTextInput';
import { ToggleButtonRole } from '@/components/my-components/toggleButtonRole';

export default function LoginScreen() {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    const router = useRouter();
    const [name, setName] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [email, setEmail] = useState('');
    const [userName, setUserName] = useState('');
    // const [date , setDate] = useState(new Date());
    const [date , setDate] = useState('');
    const [picker, setPicker] = useState(false);
    const { updateData } = useRegistration();
    const [gender, setGender] = useState('');
    const onGenderSelected = (genderSelected: string) => {
        setGender(genderSelected);
    }
    const handleContinuar = () => {
        console.log('Username capturado', userName)

        if (userName === '' || name === '' || apellidos === '' || email === '' || date === '' || gender === '') {
            console.log('Faltan datos!')
            return
        }
        updateData({ username: userName, name: name, apellidos: apellidos, email: email, date: date, gender: gender });
        router.push('./createAccountPassword')
    };

    const toggleDatePicker = () => {
        setPicker(!picker);
    };

    // const onChange = ({ type }, selectedDate) => {
    //     if(type == "set") {
    //         const currentDate = selectedDate;
    //         setDate(currentDate);

    //         if(Platform.OS === "android") {
    //             toggleDatePicker();
                
    //         }
    //     } else {
    //         toggleDatePicker();
    //     }
    // };

  return (
    <View style={[styles.main, {
            backgroundColor: currentColors.background}]}>
        <Image
            style={styles.logo}
            source={currentColors.imgSource2}
        />
        <CustomForm title='Continuar' onPress={handleContinuar}>
            <FirstTextInput
                placeholder='Nombre'
                value={name}
                onChangeText={setName}
                autoCapitalize='words'
                // keyboardType=''
            />
            <MiddleTextInput
                placeholder='Apellidos'
                value={apellidos}
                onChangeText={setApellidos}
                autoCapitalize='words'
                // keyboardType=''
            />
            <MiddleTextInput
                placeholder='Correo electrónico'
                value={email}
                onChangeText={setEmail}
                autoCapitalize='none'
                keyboardType='email-address'
            />
            <MiddleTextInput
                placeholder='Nombre de usuario'
                value={userName}
                onChangeText={setUserName}
                autoCapitalize='none'
            />
            <MiddleTextInput
                placeholder='Fecha de nacimiento'
                value={date}
                onChangeText={setDate}
                autoCapitalize='none'
                keyboardType='numbers-and-punctuation'
            />
            <LastTextInput
                placeholder='Sexo'
                value={gender}              
                onChangeText={setGender}
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
        height: 94,
        width: 200
    }
})