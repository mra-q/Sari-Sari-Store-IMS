// Inventory/components/ProductCard.tsx

import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/types/product';
import { formatCurrency } from '@/utils/helpers';
import StockStatusBadge from '@/components/ui/StockStatusBadge';
import { theme } from '@/theme';

interface ProductCardProps {
  product: Product;
  highlightLabel?: string;
  onPress?: () => void;
}

export default function ProductCard({ product, highlightLabel, onPress }: ProductCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Ionicons name="cube-outline" size={20} color={theme.colors.primary[600]} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.category} numberOfLines={1}>
            {product.category}
          </Text>
        </View>
        {highlightLabel && (
          <View style={styles.highlightBadge}>
            <Text style={styles.highlightText}>{highlightLabel}</Text>
          </View>
        )}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Barcode</Text>
          <Text style={styles.metaValue}>{product.barcode}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Price</Text>
          <Text style={styles.metaValue}>{formatCurrency(product.price)}</Text>
        </View>
      </View>

      <StockStatusBadge
        stock={product.stock}
        minimumStockLevel={product.minimumStockLevel}
      />
    </Pressable>
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
    alignItems: 'center',
    gap: theme.spacing.sm + 4,
    marginBottom: theme.spacing.sm + 4,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  name: {
    ...theme.textStyles.bodyLarge,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  category: {
    ...theme.textStyles.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  highlightBadge: {
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  highlightText: {
    ...theme.textStyles.caption,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[700],
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm + 4,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    ...theme.textStyles.caption,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.tertiary,
  },
  metaValue: {
    ...theme.textStyles.bodySmall,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginTop: 2,
  },
});
