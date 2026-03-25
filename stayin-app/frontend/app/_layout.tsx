import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const theme = useColorScheme() ?? 'light';
  const currentColors = Colors[theme];
  return (
    // El Stack envuelve todas tus pantallas y les da animaciones nativas
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: currentColors.background
      },
      headerShadowVisible: false,
      headerTitle: ''
      }}>
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="createAccountUserName" 
        options={{ 
            headerShown: true, // También la ocultamos aquí para mantener tu diseño limpio
            animation: 'slide_from_right' // Forzamos la animación suave (opcional, suele venir por defecto)
        }} 
      />
    </Stack>
  );
}