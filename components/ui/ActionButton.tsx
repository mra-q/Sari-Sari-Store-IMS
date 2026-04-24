// Inventory/components/ui/ActionButton.tsx

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

type ActionButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

interface ActionButtonProps {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: ActionButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export default function ActionButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  fullWidth = true,
  loading = false,
  disabled = false,
}: ActionButtonProps) {
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primary,
          text: styles.primaryText,
          loaderColor: theme.colors.text.inverse,
        };
      case 'secondary':
        return {
          container: styles.secondary,
          text: styles.secondaryText,
          loaderColor: theme.colors.primary[700],
        };
      case 'outline':
        return {
          container: styles.outline,
          text: styles.outlineText,
          loaderColor: theme.colors.text.primary,
        };
      case 'danger':
        return {
          container: styles.danger,
          text: styles.dangerText,
          loaderColor: theme.colors.text.inverse,
        };
      case 'ghost':
        return {
          container: styles.ghost,
          text: styles.ghostText,
          loaderColor: theme.colors.text.secondary,
        };
      default:
        return {
          container: styles.primary,
          text: styles.primaryText,
          loaderColor: theme.colors.text.inverse,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={variantStyles.loaderColor} />
        ) : (
          icon && <Ionicons name={icon} size={18} color={variantStyles.text.color} />
        )}
        <Text style={[styles.label, variantStyles.text]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm + 6,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  label: {
    ...theme.textStyles.button,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  primary: {
    backgroundColor: theme.colors.primary[500],
    ...theme.shadows.sm,
  },
  primaryText: {
    color: theme.colors.text.inverse,
  },
  secondary: {
    backgroundColor: theme.colors.primary[50],
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  secondaryText: {
    color: theme.colors.primary[700],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  outlineText: {
    color: theme.colors.text.primary,
  },
  danger: {
    backgroundColor: theme.colors.danger[500],
    ...theme.shadows.sm,
  },
  dangerText: {
    color: theme.colors.text.inverse,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: theme.colors.text.secondary,
  },
  disabled: {
    opacity: 0.5,
  },
});
