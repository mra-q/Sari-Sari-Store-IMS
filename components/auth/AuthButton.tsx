// Inventory/components/auth/AuthButton.tsx

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, Pressable } from 'react-native';
import { theme } from '@/theme';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export default function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.colors.text.inverse : theme.colors.primary[600]}
        />
      ) : (
        <Text style={[styles.label, variant === 'primary' ? styles.primaryText : styles.secondaryText]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  primary: {
    backgroundColor: theme.colors.primary[500],
  },
  secondary: {
    backgroundColor: theme.colors.card,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  primaryText: {
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
  secondaryText: {
    fontFamily: 'Poppins_700Bold',
    color: theme.colors.text.primary,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
