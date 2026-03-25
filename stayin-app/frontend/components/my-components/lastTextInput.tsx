import { Colors } from '@/constants/theme';
import { StyleSheet, TextInput, TextInputProps, useColorScheme } from 'react-native';

export function LastTextInput({...rest}: TextInputProps) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    return (        
        <TextInput
            style={[styles.form, {
                borderColor: currentColors.formBorderColor,
                backgroundColor: currentColors.formTextArea,
                color: currentColors.formTextColor
            }]}
            placeholderTextColor={currentColors.formTextColor}
            {...rest}
        />
    )
}

const styles = StyleSheet.create({
    form: {
        backgroundColor: "#E6E6E6",
        padding: 20,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 0,
        borderColor: "#999999",
        fontWeight: "bold"
    }
})