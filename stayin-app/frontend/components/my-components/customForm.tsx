import { Colors } from '@/constants/theme';
import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

interface CustomProps {
    title: string,
    onPress: () => void,
    children: ReactNode
}

export function CustomForm({ title, onPress, children }: CustomProps) {
    const theme = useColorScheme() ?? 'light';
    const currentColors = Colors[theme];
    return (
        <View style={styles.formBox}>
            {children}                
            <TouchableOpacity 
            style={[styles.submitButton,{
                backgroundColor: currentColors.formButtonColor
            }]}>
                <Text style={[styles.submitButtonText, {
                    color: currentColors.background
                }]}
                    onPress={onPress}
                >
                    {title}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({    
    formBox: {
        width: "100%",
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
})