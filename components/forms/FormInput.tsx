// Inventory/components/forms/FormInput.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '@/theme';

interface FormInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  helperText?: string;
  containerStyle?: object;
}

export default function FormInput({
  label,
  value,
  onChangeText,
  error,
  required = false,
  helperText,
  containerStyle,
  ...props
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={theme.colors.text.tertiary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md + 4,
  },
  label: {
    ...theme.textStyles.bodySmall,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.danger[500],
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
    ...theme.textStyles.body,
    color: theme.colors.text.primary,
  },
  inputFocused: {
    borderColor: theme.colors.primary[500],
    ...theme.shadows.sm,
  },
  inputError: {
    borderColor: theme.colors.danger[500],
  },
  errorText: {
    ...theme.textStyles.caption,
    color: theme.colors.danger[500],
    marginTop: theme.spacing.xs,
  },
  helperText: {
    ...theme.textStyles.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
});
