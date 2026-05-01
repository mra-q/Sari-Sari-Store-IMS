import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import { getProducts } from '@/services/productService';
import { createRestockRequest } from '@/services/restockRequestService';
import type { Product } from '@/types/product';

export default function RestockRequestScreen() {
  const params = useLocalSearchParams<{ productId?: string; returnTo?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(params.productId || '');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleSubmit = async () => {
    if (!selectedProductId) {
      Alert.alert('Error', 'Please select a product.');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity.');
      return;
    }

    setSubmitting(true);
    try {
      await createRestockRequest({
        productId: selectedProductId,
        requestedQty: Number(quantity),
        notes,
      });
      setSubmitting(false);
      router.dismiss();
      setTimeout(() => {
        Alert.alert('Success', 'Restock request submitted successfully.');
      }, 100);
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert('Error', err?.message ?? 'Failed to submit request.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Header title="Request Restock" onBackPress={() => router.dismiss()} />
        <View style={styles.center}>
          <ActivityIndicator color="#2B3A7E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Request Restock" onBackPress={() => router.dismiss()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Product *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={selectedProduct ? styles.dropdownText : styles.dropdownPlaceholder}>
              {selectedProduct ? selectedProduct.name : 'Select a product'}
            </Text>
            <Ionicons
              name={showDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdownList}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {products.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedProductId(product.id);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{product.name}</Text>
                    <Text style={styles.dropdownItemStock}>Stock: {product.stock}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {selectedProduct && (
            <View style={styles.productInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Stock:</Text>
                <Text style={styles.infoValue}>{selectedProduct.stock} units</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Min Stock Level:</Text>
                <Text style={styles.infoValue}>{selectedProduct.minimumStockLevel} units</Text>
              </View>
            </View>
          )}

          <Text style={styles.label}>Requested Quantity *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter quantity"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any additional notes..."
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Submit Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
    marginTop: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Poppins_500Medium',
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Poppins_400Regular',
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Poppins_500Medium',
  },
  dropdownItemStock: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  productInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8FAFF',
    borderRadius: 10,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins_500Medium',
  },
  infoValue: {
    fontSize: 12,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Poppins_400Regular',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#2B3A7E',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
});
