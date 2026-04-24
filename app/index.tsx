// app/index.tsx - Splash/Launcher Screen
import { View, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { normalizeUserRole } from '@/hooks/useUserRole';

export default function LauncherScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, role, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        const mustChangePassword = user?.mustChangePassword || user?.must_change_password;
        router.replace(
          (mustChangePassword
            ? normalizeUserRole(role) === 'staff'
              ? '/(staff)/profile'
              : '/(owner)/profile'
            : normalizeUserRole(role) === 'staff'
              ? '/(staff)/inventory'
              : '/(owner)') as any
        );
      } else {
        router.replace('/(auth)/login' as any);
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, role, router, user]);

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/inv-icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 32,
  },
});
