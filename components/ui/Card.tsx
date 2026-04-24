// Inventory/components/ui/Card.tsx

import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: keyof typeof theme.spacing;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function Card({
  children,
  onPress,
  style,
  padding = 'md',
  elevation = 'md',
}: CardProps) {
  const CardWrapper = onPress ? Pressable : View;

  return (
    <CardWrapper
      style={({ pressed }: any) => [
        styles.card,
        { padding: theme.spacing[padding] },
        theme.shadows[elevation],
        pressed && onPress && styles.cardPressed,
        style,
      ]}
      onPress={onPress}
    >
      {children}
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
});
