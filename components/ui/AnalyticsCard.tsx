// Inventory/components/ui/AnalyticsCard.tsx

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onPress?: () => void;
}

export default function AnalyticsCard({
  title,
  value,
  icon,
  iconColor = theme.colors.primary[600],
  iconBgColor = theme.colors.primary[50],
  trend,
  onPress,
}: AnalyticsCardProps) {
  const CardWrapper = onPress ? Pressable : View;

  return (
    <CardWrapper
      style={({ pressed }: any) => [
        styles.card,
        pressed && onPress && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, trend.isPositive ? styles.trendPositive : styles.trendNegative]}>
            <Ionicons
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={12}
              color={trend.isPositive ? theme.colors.success[600] : theme.colors.danger[600]}
            />
            <Text style={[styles.trendText, trend.isPositive ? styles.trendTextPositive : styles.trendTextNegative]}>
              {trend.value}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm + 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  trendPositive: {
    backgroundColor: theme.colors.success[50],
  },
  trendNegative: {
    backgroundColor: theme.colors.danger[50],
  },
  trendText: {
    ...theme.textStyles.caption,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  trendTextPositive: {
    color: theme.colors.success[700],
  },
  trendTextNegative: {
    color: theme.colors.danger[700],
  },
  value: {
    ...theme.textStyles.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.textStyles.bodySmall,
    color: theme.colors.text.secondary,
  },
});
