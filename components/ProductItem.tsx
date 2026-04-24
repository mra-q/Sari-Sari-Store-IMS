import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/types/product';
import { formatCurrency } from '@/utils/helpers';
import StockStatusBadge from '@/components/ui/StockStatusBadge';

interface ProductItemProps {
  product: Product;
  onPress?: (product: Product) => void;
  onUpdateQuantity?: (product: Product) => void;
  showUpdateButton?: boolean;
}

export default function ProductItem({
  product,
  onPress,
  onUpdateQuantity,
  showUpdateButton = false,
}: ProductItemProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onPress?.(product)}
    >
      <View style={styles.imagePlaceholder}>
        <View style={styles.topRow}>
          <View style={styles.categoryChip}>
            <Text style={styles.category} numberOfLines={1}>
              {product.category}
            </Text>
          </View>

          {showUpdateButton && (
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.8}
              onPress={() => onUpdateQuantity?.(product)}
            >
              <Ionicons name="add" size={16} color="#2B3A7E" />
            </TouchableOpacity>
          )}
        </View>

        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imageContent}>
            <View style={styles.imageIconWrap}>
              <Ionicons name="image-outline" size={24} color="#2B3A7E" />
            </View>
            <Text style={styles.imagePlaceholderText}>Product image</Text>
          </View>
        )}
      </View>

      <Text style={styles.productName} numberOfLines={2}>
        {product.name}
      </Text>

      <View style={styles.priceBlock}>
        <Text style={styles.priceLabel}>Unit Price</Text>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
      </View>

      <View style={styles.footer}>
        <StockStatusBadge
          stock={product.stock ?? 0}
          minimumStockLevel={product.minimumStockLevel ?? 0}
          compact
        />
        <View style={styles.footerArrow}>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    minHeight: 156,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#F6F9FF',
    borderRadius: 16,
    padding: 6,
    minHeight: 80,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E6EEF9',
  },
  imageContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  productImage: {
    width: '100%',
    height: 42,
    borderRadius: 12,
    marginTop: 6,
  },
  imageIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 8,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  categoryChip: {
    maxWidth: '72%',
    backgroundColor: '#EFF5FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  category: {
    fontSize: 10,
    color: '#2B3A7E',
    fontFamily: 'Poppins_500Medium',
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0ECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontSize: 13,
    lineHeight: 16,
    color: '#1F2937',
    fontFamily: 'Poppins_600SemiBold',
    minHeight: 28,
    marginBottom: 2,
  },
  priceBlock: {
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 8,
    color: '#94A3B8',
    fontFamily: 'Poppins_500Medium',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  price: {
    fontSize: 14,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 2,
  },
  footerArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
