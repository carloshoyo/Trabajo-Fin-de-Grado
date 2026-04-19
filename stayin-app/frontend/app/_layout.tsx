import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { RegistrationProvider } from '@/context/RegistrationContext';
import { LoginProvider } from '@/context/LoginContext';
import { PostAdProvider } from '@/context/PostAdContext';

export default function RootLayout() {
  const theme = useColorScheme() ?? 'light';
  const currentColors = Colors[theme];
  return (
    <RegistrationProvider>
      <LoginProvider>
        <PostAdProvider>
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
              name="(crear-anuncio)" 
              options={{ 
                headerShown: false,
                presentation: 'modal'
              }} 
            />
            <Stack.Screen 
              name="homeCasero" 
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
        </PostAdProvider>
      </LoginProvider>
    </RegistrationProvider>
    
  );
}