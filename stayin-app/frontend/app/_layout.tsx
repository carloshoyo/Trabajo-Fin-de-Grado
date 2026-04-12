import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { RegistrationProvider } from '@/context/RegistrationContext';
import { LoginProvider } from '@/context/LoginContext';

export default function RootLayout() {
  const theme = useColorScheme() ?? 'light';
  const currentColors = Colors[theme];
  return (
    <RegistrationProvider>
      <LoginProvider>
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
          name="homeInquilino" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="createAccountUserName" 
          options={{
              headerShown: true,
              animation: 'slide_from_right'
          }} 
        />
      </Stack>
      </LoginProvider>
    </RegistrationProvider>
    
  );
}