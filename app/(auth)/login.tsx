import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useLogin } from '@/hooks/useLogin';
import { normalizeUserRole } from '@/hooks/useUserRole';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import { theme } from '@/theme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending } = useLogin();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleLogin = () => {
    if (!email.trim() || !password) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.98, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      return;
    }

    login(
      { email, password },
      {
        onSuccess: (role) => {
          const destination = role.mustChangePassword || role.must_change_password
            ? normalizeUserRole(role.role) === 'staff'
              ? '/(staff)/profile'
              : '/(owner)/profile'
            : normalizeUserRole(role.role) === 'staff'
              ? '/(staff)/inventory'
              : '/(owner)';
          router.replace(destination);
        },
        onError: (error) => {
          Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.98, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
          ]).start();
          Alert.alert(
            'Login Failed',
            error.message || 'Unable to sign in.',
          );
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/inv-icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Form Section */}
        <Animated.View style={[styles.form, { transform: [{ scale: scaleAnim }] }]}>
          <AuthInput
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AuthInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            isPassword
          />

          <Pressable style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </Pressable>

          <AuthButton
            label={isPending ? 'Signing in...' : 'Sign In'}
            onPress={handleLogin}
            loading={isPending}
            disabled={isPending}
          />
        </Animated.View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={styles.signupPrompt}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={styles.signupText}>
              Don&apos;t have an account?{' '}
              <Text style={styles.signupLink}>Sign up</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.lg,
    marginTop: -theme.spacing.sm,
  },
  forgotPasswordText: {
    ...theme.textStyles.bodySmall,
    color: theme.colors.primary[600],
    fontFamily: theme.typography.fontFamily.medium,
  },
  footer: {
    marginTop: theme.spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    ...theme.textStyles.bodySmall,
    color: theme.colors.text.tertiary,
    marginHorizontal: theme.spacing.md,
  },
  signupPrompt: {
    alignItems: 'center',
  },
  signupText: {
    ...theme.textStyles.body,
    color: theme.colors.text.secondary,
  },
  signupLink: {
    color: theme.colors.primary[600],
    fontFamily: theme.typography.fontFamily.semibold,
  },
});
