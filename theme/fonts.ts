// Inventory/theme/fonts.ts

/**
 * Font Loading Utility
 * 
 * Loads Poppins fonts before the app renders.
 * Import and use in your root _layout.tsx file.
 */

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

export { useFonts };

/**
 * Font configuration object for useFonts hook
 */
export const fonts = {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
};

/**
 * Hook to load Poppins fonts
 * 
 * Usage in _layout.tsx:
 * 
 * import { usePoppinsFonts } from '@/theme/fonts';
 * 
 * export default function RootLayout() {
 *   const [fontsLoaded] = usePoppinsFonts();
 *   
 *   if (!fontsLoaded) {
 *     return null; // or <SplashScreen />
 *   }
 *   
 *   return <YourApp />;
 * }
 */
export function usePoppinsFonts() {
  return useFonts(fonts);
}
