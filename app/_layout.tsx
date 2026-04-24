import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext';
import { runMigrations } from '@/services/database/migrations';
import { syncService } from '@/services/sync/syncService';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          Poppins_400Regular,
          Poppins_500Medium,
          Poppins_600SemiBold,
          Poppins_700Bold,
          ...Ionicons.font,
        });
        setAppReady(true);
      } catch (error) {
        console.warn('⚠️ Font loading failed (offline mode), using system fonts');
        // Continue anyway - app works without custom fonts
        setAppReady(true);
      }
    }
    loadFonts();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await runMigrations();
        console.log('✅ Database initialized');
        
        // Start auto-sync every 60 seconds
        const syncInterval = syncService.startAutoSync(60000);
        
        return () => clearInterval(syncInterval);
      } catch (error) {
        console.error('❌ App initialization failed:', error);
      }
    };
    
    if (appReady) {
      SplashScreen.hideAsync();
      initializeApp();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(owner)" />
          <Stack.Screen name="(staff)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}
