import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
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
      router.replace('/(owner)/product-management');
    } catch {
      setError('Unable to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(owner)/product-management')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
      </View>

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
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroEyebrow}>NEW PRODUCT</Text>
                <Text style={styles.heroTitle}>Add to Catalog</Text>
                <Text style={styles.heroSubtitle}>
                  Fill in product details to add it to your inventory catalog.
                </Text>
              </View>
              <View style={styles.heroIconWrap}>
                <Ionicons name="add-circle-outline" size={24} color="#2B3A7E" />
              </View>
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="image-outline" size={18} color="#2B3A7E" />
              <Text style={styles.sectionTitle}>Product Image</Text>
            </View>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.85}>
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

          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={18} color="#2B3A7E" />
              <Text style={styles.sectionTitle}>Basic Information</Text>
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
          </View>

          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetag-outline" size={18} color="#2B3A7E" />
              <Text style={styles.sectionTitle}>Pricing & Stock</Text>
            </View>
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
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

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
              onPress={() => router.replace('/(owner)/product-management')}
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
  header: {
    backgroundColor: '#2B3A7E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5EDF9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    lineHeight: 26,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    fontFamily: 'Poppins_400Regular',
    marginTop: 6,
  },
  heroIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E9EEF7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  imagePicker: {
    width: 140,
    height: 140,
    borderRadius: 16,
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
    backgroundColor: '#F8FAFC',
  },
  imagePlaceholderText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#9CA3AF',
    marginTop: 8,
  },
  actionRow: {
    marginTop: 8,
    gap: 10,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
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
