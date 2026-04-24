import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
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
      <Header title="Categories" />

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
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add Category</Text>
            <FormInput
              label="Category Name"
              placeholder="e.g. Hardware"
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
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Edit Category</Text>
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

          <Text style={styles.sectionTitle}>Existing Categories</Text>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            refreshing={loading}
            onRefresh={loadCategories}
            renderItem={({ item }) => (
              <View style={styles.categoryRow}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <View style={styles.rowActions}>
                  <ActionButton
                    label="Edit"
                    variant="ghost"
                    fullWidth={false}
                    onPress={() => handleStartEdit(item)}
                  />
                  <ActionButton
                    label="Delete"
                    variant="danger"
                    fullWidth={false}
                    onPress={() => handleDelete(item)}
                  />
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No categories created yet.</Text>
              </View>
            }
          />
        </View>
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
    flex: 1,
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  cardTitle: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
  },
  actionRow: {
    gap: 10,
  },
  sectionTitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Poppins_600SemiBold',
  },
  categoryRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  categoryName: {
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  rowActions: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    color: '#6B7280',
    fontFamily: 'Poppins_500Medium',
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
