import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import ProductItem from '@/components/ProductItem';
import { getProducts } from '@/services/productService';
import { createStockMovement } from '@/services/stockMovementService';
import type { Product } from '@/types/product';

export default function UpdateStockScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch {
      Alert.alert('Error', 'Unable to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchMatched =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.barcode.includes(search);
      return searchMatched;
    });
  }, [products, search]);

  const handleUpdateQuantity = async (product: Product) => {
    if (!user) {
      Alert.alert('Update Failed', 'You must be logged in to update stock.');
      return;
    }
    try {
      const movement = await createStockMovement(
        { productId: product.id, direction: 'in', reason: 'received', quantity: 1 },
        user.id,
        user.name,
      );
      setProducts((current) =>
        current.map((item) =>
          item.id === movement.productId ? { ...item, stock: movement.newStock } : item,
        ),
      );
    } catch {
      Alert.alert('Update Failed', 'Unable to update stock.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        title="Update Stock"
        showSearch
        showFilter={false}
        searchPlaceholder="Search by name or barcode"
        searchValue={search}
        onSearchChangeText={setSearch}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadProducts} />}
        renderItem={({ item }) => (
          <ProductItem
            product={item}
            showUpdateButton
            onUpdateQuantity={handleUpdateQuantity}
            onPress={() => router.push(`/product/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found.</Text>
            <TouchableOpacity onPress={() => router.push('/(staff)/scan')}>
              <Text style={styles.emptyAction}>Scan a product</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6B7280',
    fontFamily: 'Poppins_500Medium',
  },
  emptyAction: {
    marginTop: 8,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
});




