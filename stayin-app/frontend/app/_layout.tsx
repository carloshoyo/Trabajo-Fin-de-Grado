import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { RegistrationProvider } from '@/context/RegistrationContext';
import { LoginProvider } from '@/context/LoginContext';
import { PostAdProvider } from '@/context/PostAdContext';
import { useEffect } from 'react';

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
            }}
          >
            <Stack.Screen 
              name="index" 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="homeInquilino" 
              options={{ 
                headerShown: false,
                animation: 'fade',
                animationDuration: 200
              }}
              
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
              options={{ 
                headerShown: false,
                animation: 'fade',
                animationDuration: 200
              }}
            />
            <Stack.Screen 
              name="createAccountUserName" 
              options={{
                  headerShown: true,
                  animation: 'slide_from_right'
              }} 
            />
            <Stack.Screen
              name="AdView"
              options={{
                headerShown: false,
                presentation: 'modal'
              }}
            />
            <Stack.Screen
              name="adViewInquilino"
              options={{
                headerShown: false,
                presentation: 'modal'
              }}
            />
            <Stack.Screen
              name="screenSocial"
              options={{
                headerShown: false,
                animation: 'fade',
                animationDuration: 100
              }}
            />
            <Stack.Screen
              name="searchScreen"
              options={{
                headerShown: false,
                animation: 'fade',
                animationDuration: 100
              }}
            />
            <Stack.Screen
              name="editProfile"
              options={{
                headerShown: false,
                animation: 'fade',
                animationDuration: 100
              }}
            />
          </Stack>
        </PostAdProvider>
      </LoginProvider>
    </RegistrationProvider>
    
  );
}