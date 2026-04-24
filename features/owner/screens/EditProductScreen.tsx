import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import FormInput from '@/components/forms/FormInput';
import ActionButton from '@/components/ui/ActionButton';
import { RoleBasedView } from '@/components/RoleBasedView';
import { getProductById, updateProduct } from '@/services/productService';

export default function EditProductScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const productId = useMemo(() => {
    if (!params.id) return '';
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params.id]);

  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [minimumStockLevel, setMinimumStockLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError('Product not found.');
        setLoadingProduct(false);
        return;
      }
      try {
        const product = await getProductById(productId);
        if (!product) {
          setError('Product not found.');
        } else {
          setName(product.name);
          setBarcode(product.barcode);
          setCategory(product.category);
          setPrice(String(product.price));
          setStock(String(product.stock));
          setMinimumStockLevel(String(product.minimumStockLevel ?? 5));
        }
      } catch {
        setError('Unable to load product details.');
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [productId]);

  const isValid = useMemo(() => {
    return (
      name.trim().length > 0 &&
      barcode.trim().length > 0 &&
      category.trim().length > 0 &&
      Number(price) >= 0 &&
      Number(stock) >= 0
    );
  }, [name, barcode, category, price, stock]);

  const handleSubmit = async () => {
    if (!isValid || !productId) {
      setError('Please complete all required fields.');
      return;
    }

    const priceValue = Number(price);
    const stockValue = Number(stock);
    const minimumValue = Number(minimumStockLevel);

    if (Number.isNaN(priceValue) || Number.isNaN(stockValue)) {
      setError('Price and stock must be valid numbers.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updated = await updateProduct(productId, {
        name: name.trim(),
        barcode: barcode.trim(),
        category: category.trim(),
        price: priceValue,
        stock: stockValue,
        minimumStockLevel: Number.isNaN(minimumValue) ? undefined : minimumValue,
      });
      Alert.alert('Product Updated', `${updated.name} has been updated.`);
      router.replace(`/product/${updated.id}`);
    } catch {
      setError('Unable to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Edit Product" onBackPress={() => router.back()} />

      <RoleBasedView
        roles={['owner']}
        fallback={
          <View style={styles.restrictedContainer}>
            <Text style={styles.restrictedText}>
              Only store owners can edit product details.
            </Text>
          </View>
        }
      >
        <ScrollView contentContainerStyle={styles.content}>
          {loadingProduct ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator size="large" color="#2B3A7E" />
              <Text style={styles.loadingText}>Loading product details...</Text>
            </View>
          ) : error ? (
            <View style={styles.loadingBlock}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Update product details and keep inventory accurate.
              </Text>

              <FormInput
                label="Product Name"
                placeholder="e.g. Coca-Cola 1.5L"
                value={name}
                onChangeText={setName}
              />
              <FormInput
                label="Barcode"
                placeholder="Scan or type barcode"
                value={barcode}
                onChangeText={setBarcode}
              />
              <FormInput
                label="Category"
                placeholder="e.g. Beverages"
                value={category}
                onChangeText={setCategory}
              />
              <FormInput
                label="Price"
                placeholder="0.00"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
              <FormInput
                label="Current Stock"
                placeholder="0"
                value={stock}
                onChangeText={setStock}
                keyboardType="number-pad"
              />
              <FormInput
                label="Low Stock Threshold"
                placeholder="5"
                value={minimumStockLevel}
                onChangeText={setMinimumStockLevel}
                keyboardType="number-pad"
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.actionRow}>
                <ActionButton
                  label="Save Changes"
                  icon="checkmark-circle-outline"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={!isValid}
                />
                <ActionButton
                  label="Cancel"
                  variant="ghost"
                  onPress={() => router.back()}
                />
              </View>
            </>
          )}
        </ScrollView>
      </RoleBasedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 16,
  },
  actionRow: {
    marginTop: 8,
    gap: 10,
  },
  loadingBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
    fontFamily: 'Poppins_500Medium',
  },
  errorText: {
    color: '#DC2626',
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
  },
  restrictedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  restrictedText: {
    textAlign: 'center',
    color: '#6B7280',
    fontFamily: 'Poppins_500Medium',
  },
});
