import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import FormInput from '@/components/forms/FormInput';
import FormDropdown from '@/components/forms/FormDropdown';
import ActionButton from '@/components/ui/ActionButton';
import { RoleBasedView } from '@/components/RoleBasedView';
import { createProduct, getCategoriesForDropdown } from '@/services/productService';

export default function AddProductScreen() {
  const params = useLocalSearchParams<{ barcode?: string }>();
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState(params.barcode ?? '');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [minimumStockLevel, setMinimumStockLevel] = useState('5');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await getCategoriesForDropdown();
      console.log('Categories loaded:', cats);
      setCategories(cats.map((cat) => ({ label: cat.name, value: cat.name })));
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

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
    if (!isValid) {
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
      const created = await createProduct({
        name: name.trim(),
        barcode: barcode.trim(),
        category: category.trim(),
        price: priceValue,
        stock: stockValue,
        minimumStockLevel: Number.isNaN(minimumValue) ? undefined : minimumValue,
      });
      Alert.alert('Product Added', `${created.name} has been added.`);
      router.replace(`/product/${created.id}`);
    } catch {
      setError('Unable to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Add Product" onBackPress={() => router.back()} />

      <RoleBasedView
        roles={['owner']}
        fallback={
          <View style={styles.restrictedContainer}>
            <Text style={styles.restrictedText}>
              Only store owners can add new products.
            </Text>
          </View>
        }
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.subtitle}>Fill in product details to add it to inventory.</Text>

          <View style={styles.imageSection}>
            <Text style={styles.imageLabel}>Product Image</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
                  <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

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
          <FormDropdown
            label="Category"
            value={category}
            options={categories}
            onSelect={setCategory}
            placeholder="Select category"
            required
          />
          <FormInput
            label="Price"
            placeholder="0.00"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
          <FormInput
            label="Starting Stock"
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
              label="Save Product"
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
  imageSection: {
    marginBottom: 16,
  },
  imageLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#374151',
    marginBottom: 8,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  imagePlaceholderText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#9CA3AF',
    marginTop: 8,
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
  errorText: {
    color: '#DC2626',
    fontFamily: 'Poppins_500Medium',
    marginBottom: 8,
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
