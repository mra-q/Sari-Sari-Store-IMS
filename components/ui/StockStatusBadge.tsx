// Inventory/components/ui/StockStatusBadge.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

interface StockStatusBadgeProps {
  stock: number;
  minimumStockLevel: number;
  compact?: boolean;
}

export default function StockStatusBadge({
  stock,
  minimumStockLevel,
  compact = false,
}: StockStatusBadgeProps) {
  const getStockStatus = () => {
    if (stock === 0) {
      return {
        label: 'Out of Stock',
        compactLabel: 'Out',
        icon: 'alert-circle' as const,
        containerStyle: styles.outOfStock,
        textStyle: styles.outOfStockText,
        iconColor: theme.colors.danger[600],
      };
    }
    if (stock <= minimumStockLevel) {
      return {
        label: 'Low Stock',
        compactLabel: 'Low',
        icon: 'warning' as const,
        containerStyle: styles.lowStock,
        textStyle: styles.lowStockText,
        iconColor: theme.colors.warning[600],
      };
    }
    return {
      label: 'In Stock',
      compactLabel: 'In',
      icon: 'checkmark-circle' as const,
      containerStyle: styles.inStock,
      textStyle: styles.inStockText,
      iconColor: theme.colors.success[600],
    };
  };

  const status = getStockStatus();

  return (
    <View
      style={[
        styles.container,
        status.containerStyle,
        compact && styles.compactContainer,
      ]}
    >
      <Ionicons
        name={status.icon}
        size={compact ? 12 : 14}
        color={status.iconColor}
      />
      <Text
        style={[
          styles.label,
          status.textStyle,
          compact && styles.compactText,
        ]}
      >
        {compact ? status.compactLabel : status.label}
      </Text>
      <Text
        style={[
          styles.stock,
          status.textStyle,
          compact && styles.compactText,
        ]}
      >
        {compact ? `• ${stock}` : `• ${stock} units`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.full,
    gap: 6,
  },
  compactContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    flexShrink: 1,
  },
  label: {
    ...theme.textStyles.caption,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  stock: {
    ...theme.textStyles.caption,
    fontWeight: theme.typography.fontWeight.medium,
  },
  compactText: {
    fontSize: 10,
    lineHeight: 12,
  },
  inStock: {
    backgroundColor: theme.colors.success[50],
  },
  inStockText: {
    color: theme.colors.success[700],
  },
  lowStock: {
    backgroundColor: theme.colors.warning[50],
  },
  lowStockText: {
    color: theme.colors.warning[700],
  },
  outOfStock: {
    backgroundColor: theme.colors.danger[50],
  },
  outOfStockText: {
    color: theme.colors.danger[700],
  },
});
