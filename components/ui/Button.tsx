// Inventory/components/ui/Button.tsx

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export default function Button({
  label,
  onPress,
  icon,
  iconPosition = 'left',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { container: styles.primary, text: styles.primaryText, iconColor: theme.colors.text.inverse };
      case 'secondary':
        return { container: styles.secondary, text: styles.secondaryText, iconColor: theme.colors.primary[700] };
      case 'outline':
        return { container: styles.outline, text: styles.outlineText, iconColor: theme.colors.text.primary };
      case 'danger':
        return { container: styles.danger, text: styles.dangerText, iconColor: theme.colors.text.inverse };
      case 'success':
        return { container: styles.success, text: styles.successText, iconColor: theme.colors.text.inverse };
      case 'ghost':
        return { container: styles.ghost, text: styles.ghostText, iconColor: theme.colors.text.secondary };
      default:
        return { container: styles.primary, text: styles.primaryText, iconColor: theme.colors.text.inverse };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { container: styles.sizeSm, text: styles.textSm, iconSize: 16 };
      case 'md':
        return { container: styles.sizeMd, text: styles.textMd, iconSize: 18 };
      case 'lg':
        return { container: styles.sizeLg, text: styles.textLg, iconSize: 20 };
      default:
        return { container: styles.sizeMd, text: styles.textMd, iconSize: 18 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <View style={[styles.content, iconPosition === 'right' && styles.contentReverse]}>
        {loading ? (
          <ActivityIndicator size="small" color={variantStyles.iconColor} />
        ) : (
          icon && <Ionicons name={icon} size={sizeStyles.iconSize} color={variantStyles.iconColor} />
        )}
        <Text style={[styles.label, variantStyles.text, sizeStyles.text]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.sm,
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
  contentReverse: {
    flexDirection: 'row-reverse',
  },
  label: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  // Sizes
  sizeSm: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm + 4,
  },
  sizeMd: {
    paddingVertical: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.md,
  },
  sizeLg: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  textSm: {
    ...theme.textStyles.bodySmall,
  },
  textMd: {
    ...theme.textStyles.body,
  },
  textLg: {
    ...theme.textStyles.bodyLarge,
  },
  // Variants
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
  success: {
    backgroundColor: theme.colors.success[500],
    ...theme.shadows.sm,
  },
  successText: {
    color: theme.colors.text.inverse,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: theme.colors.text.secondary,
  },
});
