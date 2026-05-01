import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import FormInput from '@/components/forms/FormInput';
import ActionButton from '@/components/ui/ActionButton';
import { RoleBasedView } from '@/components/RoleBasedView';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type Category,
} from '@/services/categoryService';

export default function CategoryManagementScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch {
      Alert.alert('Error', 'Unable to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async () => {
    if (!newCategory.trim()) return;
    try {
      const created = await createCategory(newCategory.trim());
      setCategories((current) => [created, ...current]);
      setNewCategory('');
    } catch {
      Alert.alert('Error', 'Unable to add category.');
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleUpdate = async () => {
    if (!editingId || !editingName.trim()) return;
    try {
      const updated = await updateCategory(editingId, editingName.trim());
      setCategories((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setEditingId(null);
      setEditingName('');
    } catch {
      Alert.alert('Error', 'Unable to update category.');
    }
  };

  const handleDelete = async (category: Category) => {
    try {
      await deleteCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
    } catch {
      Alert.alert('Error', 'Unable to delete category.');
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
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      <RoleBasedView
        roles={['owner']}
        fallback={
          <View style={styles.restrictedContainer}>
            <Text style={styles.restrictedText}>
              Category management is available for store owners only.
            </Text>
          </View>
        }
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroEyebrow}>CATALOG ORGANIZATION</Text>
                <Text style={styles.heroTitle}>Manage Categories</Text>
                <Text style={styles.heroSubtitle}>
                  Create and organize product categories to keep your inventory structured.
                </Text>
              </View>
              <View style={styles.heroIconWrap}>
                <Ionicons name="pricetags-outline" size={24} color="#2B3A7E" />
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{categories.length}</Text>
                <Text style={styles.statLabel}>Total Categories</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{editingId ? '1' : '0'}</Text>
                <Text style={styles.statLabel}>Editing</Text>
              </View>
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="add-circle-outline" size={18} color="#2B3A7E" />
              <Text style={styles.sectionTitle}>Add New Category</Text>
            </View>
            <FormInput
              label="Category Name"
              placeholder="e.g. Hardware, Beverages, Electronics"
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <ActionButton
              label="Add Category"
              icon="add-circle-outline"
              onPress={handleCreate}
              disabled={!newCategory.trim()}
              loading={loading}
            />
          </View>

          {editingId ? (
            <View style={styles.editCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="create-outline" size={18} color="#2B3A7E" />
                <Text style={styles.sectionTitle}>Edit Category</Text>
              </View>
              <FormInput
                label="Category Name"
                placeholder="Update name"
                value={editingName}
                onChangeText={setEditingName}
              />
              <View style={styles.actionRow}>
                <ActionButton
                  label="Save Changes"
                  icon="checkmark-circle-outline"
                  onPress={handleUpdate}
                  disabled={!editingName.trim()}
                />
                <ActionButton
                  label="Cancel"
                  variant="ghost"
                  onPress={() => {
                    setEditingId(null);
                    setEditingName('');
                  }}
                />
              </View>
            </View>
          ) : null}

          <View style={styles.listHeader}>
            <View style={styles.listHeaderLeft}>
              <Ionicons name="list-outline" size={18} color="#2B3A7E" />
              <Text style={styles.listHeaderTitle}>All Categories</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{categories.length}</Text>
            </View>
          </View>

          {categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="pricetags-outline" size={28} color="#2B3A7E" />
              </View>
              <Text style={styles.emptyTitle}>No categories yet</Text>
              <Text style={styles.emptyText}>
                Create your first category to start organizing your product catalog.
              </Text>
            </View>
          ) : (
            categories.map((item, index) => (
              <View key={item.id} style={styles.categoryCard}>
                <View style={styles.categoryLeft}>
                  <View style={styles.categoryIconWrap}>
                    <Ionicons name="pricetag" size={16} color="#2B3A7E" />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <Text style={styles.categoryMeta}>Category #{index + 1}</Text>
                  </View>
                </View>
                <View style={styles.categoryActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleStartEdit(item)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="create-outline" size={16} color="#2B3A7E" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
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
  scrollView: {
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
    marginBottom: 16,
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
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
  editCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
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
  actionRow: {
    gap: 10,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listHeaderTitle: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  countBadge: {
    backgroundColor: '#EAF1FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  countBadgeText: {
    fontSize: 12,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
  },
  listContent: {
    paddingBottom: 120,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E8EDF5',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  categoryMeta: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 22,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 6,
  },
  emptyText: {
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 20,
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
