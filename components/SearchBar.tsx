// Inventory/components/SearchBar.tsx

import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search products...',
}: SearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={18} color={theme.colors.text.tertiary} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <Ionicons 
          name="close-circle" 
          size={18} 
          color={theme.colors.text.tertiary} 
          onPress={() => onChangeText('')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...theme.textStyles.body,
    color: theme.colors.text.primary,
  },
});
