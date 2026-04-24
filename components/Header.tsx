// Inventory/components/Header.tsx

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
}

export default function Header({ title, subtitle, onBackPress, rightAction }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {onBackPress && (
          <Pressable
            onPress={onBackPress}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </Pressable>
        )}
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {rightAction && (
          <Pressable
            onPress={rightAction.onPress}
            style={({ pressed }) => [
              styles.rightButton,
              pressed && styles.rightButtonPressed,
            ]}
          >
            <Ionicons name={rightAction.icon} size={24} color={theme.colors.text.primary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm + 4,
  },
  backButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  backButtonPressed: {
    backgroundColor: theme.colors.neutral[100],
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...theme.textStyles.h3,
    color: theme.colors.text.primary,
  },
  subtitle: {
    ...theme.textStyles.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  rightButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  rightButtonPressed: {
    backgroundColor: theme.colors.neutral[100],
  },
});
