// Inventory/components/auth/AuthInput.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, TextInputProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/theme';

interface AuthInputProps extends TextInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  error?: string;
  containerStyle?: object;
}

export default function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  isPassword = false,
  error,
  containerStyle,
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = value.length > 0;
  const showFloatingLabel = isFocused || hasValue;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            showFloatingLabel && styles.labelFloating,
            isFocused && styles.labelFocused,
            error && styles.labelError,
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
        ]}
      >
        <TextInput
          style={[styles.input, label && styles.inputWithLabel]}
          placeholder=""
          placeholderTextColor={theme.colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color={isFocused ? theme.colors.primary[500] : theme.colors.text.tertiary}
            />
          </Pressable>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.md + 4,
  },
  label: {
    position: 'absolute',
    left: theme.spacing.md,
    top: 18,
    ...theme.textStyles.body,
    color: theme.colors.text.tertiary,
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.xs,
    zIndex: 1,
  },
  labelFloating: {
    top: -8,
    ...theme.textStyles.caption,
  },
  labelFocused: {
    color: theme.colors.primary[500],
  },
  labelError: {
    color: theme.colors.danger[500],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary[500],
    ...theme.shadows.md,
  },
  inputWrapperError: {
    borderColor: theme.colors.danger[500],
  },
  input: {
    flex: 1,
    height: 54,
    paddingHorizontal: theme.spacing.md,
    ...theme.textStyles.body,
    color: theme.colors.text.primary,
  },
  inputWithLabel: {
    paddingTop: theme.spacing.md + 2,
  },
  eyeIcon: {
    paddingHorizontal: theme.spacing.md,
  },
  errorText: {
    ...theme.textStyles.caption,
    color: theme.colors.danger[500],
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});
