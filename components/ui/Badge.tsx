// Inventory/components/ui/Badge.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: keyof typeof Ionicons.glyphMap;
  dot?: boolean;
}

export default function Badge({
  label,
  variant = 'neutral',
  size = 'md',
  icon,
  dot = false,
}: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primary,
          text: styles.primaryText,
          iconColor: theme.colors.primary[600],
          dotColor: theme.colors.primary[600],
        };
      case 'success':
        return {
          container: styles.success,
          text: styles.successText,
          iconColor: theme.colors.success[600],
          dotColor: theme.colors.success[600],
        };
      case 'warning':
        return {
          container: styles.warning,
          text: styles.warningText,
          iconColor: theme.colors.warning[600],
          dotColor: theme.colors.warning[600],
        };
      case 'danger':
        return {
          container: styles.danger,
          text: styles.dangerText,
          iconColor: theme.colors.danger[600],
          dotColor: theme.colors.danger[600],
        };
      case 'neutral':
        return {
          container: styles.neutral,
          text: styles.neutralText,
          iconColor: theme.colors.neutral[600],
          dotColor: theme.colors.neutral[600],
        };
      default:
        return {
          container: styles.neutral,
          text: styles.neutralText,
          iconColor: theme.colors.neutral[600],
          dotColor: theme.colors.neutral[600],
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { container: styles.sizeSm, text: styles.textSm, iconSize: 12, dotSize: 4 };
      case 'md':
        return { container: styles.sizeMd, text: styles.textMd, iconSize: 14, dotSize: 6 };
      case 'lg':
        return { container: styles.sizeLg, text: styles.textLg, iconSize: 16, dotSize: 8 };
      default:
        return { container: styles.sizeMd, text: styles.textMd, iconSize: 14, dotSize: 6 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, variantStyles.container, sizeStyles.container]}>
      {dot && (
        <View
          style={[
            styles.dot,
            { backgroundColor: variantStyles.dotColor, width: sizeStyles.dotSize, height: sizeStyles.dotSize },
          ]}
        />
      )}
      {icon && <Ionicons name={icon} size={sizeStyles.iconSize} color={variantStyles.iconColor} />}
      <Text style={[styles.label, variantStyles.text, sizeStyles.text]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: theme.typography.fontWeight.medium,
  },
  dot: {
    borderRadius: theme.borderRadius.full,
    marginRight: 6,
  },
  // Sizes
  sizeSm: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs - 2,
    gap: 4,
  },
  sizeMd: {
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    gap: 6,
  },
  sizeLg: {
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: theme.spacing.xs + 2,
    gap: theme.spacing.sm,
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    ...theme.textStyles.caption,
  },
  textLg: {
    ...theme.textStyles.bodySmall,
  },
  // Variants
  primary: {
    backgroundColor: theme.colors.primary[50],
  },
  primaryText: {
    color: theme.colors.primary[700],
  },
  success: {
    backgroundColor: theme.colors.success[50],
  },
  successText: {
    color: theme.colors.success[700],
  },
  warning: {
    backgroundColor: theme.colors.warning[50],
  },
  warningText: {
    color: theme.colors.warning[700],
  },
  danger: {
    backgroundColor: theme.colors.danger[50],
  },
  dangerText: {
    color: theme.colors.danger[700],
  },
  neutral: {
    backgroundColor: theme.colors.neutral[100],
  },
  neutralText: {
    color: theme.colors.neutral[700],
  },
});
