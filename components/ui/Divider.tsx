// Inventory/components/ui/Divider.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '@/theme';

interface DividerProps {
  spacing?: keyof typeof theme.spacing;
  color?: string;
}

export default function Divider({ spacing = 'md', color = theme.colors.border }: DividerProps) {
  return (
    <View
      style={[
        styles.divider,
        {
          marginVertical: theme.spacing[spacing],
          backgroundColor: color,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});
