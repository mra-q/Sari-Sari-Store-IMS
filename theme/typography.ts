// Inventory/theme/typography.ts

/**
 * Typography System - Poppins Font Family
 * 
 * Complete typography scale using Poppins fonts with proper weights,
 * sizes, line heights, and letter spacing for optimal readability.
 */

export const typography = {
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semibold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
  },
  fontSize: {
    h1: 28,
    h2: 24,
    h3: 20,
    subtitle: 18,
    bodyLarge: 16,
    body: 15,
    bodySmall: 14,
    caption: 12,
    button: 16,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    h1: 34,
    h2: 30,
    h3: 26,
    subtitle: 24,
    bodyLarge: 24,
    body: 22,
    bodySmall: 20,
    caption: 18,
    button: 20,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

/**
 * Pre-configured text styles for consistent typography throughout the app.
 * Use these in your StyleSheet.create() calls.
 * 
 * Example:
 * const styles = StyleSheet.create({
 *   title: {
 *     ...textStyles.h1,
 *     color: theme.colors.text.primary,
 *   },
 * });
 */
export const textStyles = {
  h1: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.h1,
    lineHeight: typography.lineHeight.h1,
    letterSpacing: typography.letterSpacing.tight,
  },
  h2: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.h2,
    lineHeight: typography.lineHeight.h2,
    letterSpacing: typography.letterSpacing.tight,
  },
  h3: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.h3,
    lineHeight: typography.lineHeight.h3,
    letterSpacing: typography.letterSpacing.normal,
  },
  subtitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.subtitle,
    lineHeight: typography.lineHeight.subtitle,
    letterSpacing: typography.letterSpacing.normal,
  },
  bodyLarge: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.bodyLarge,
    lineHeight: typography.lineHeight.bodyLarge,
    letterSpacing: typography.letterSpacing.normal,
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    letterSpacing: typography.letterSpacing.normal,
  },
  bodySmall: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.bodySmall,
    lineHeight: typography.lineHeight.bodySmall,
    letterSpacing: typography.letterSpacing.normal,
  },
  caption: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    lineHeight: typography.lineHeight.caption,
    letterSpacing: typography.letterSpacing.normal,
  },
  button: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.button,
    lineHeight: typography.lineHeight.button,
    letterSpacing: typography.letterSpacing.wide,
  },
};

/**
 * Font weight helpers for custom text styles
 */
export const fontWeights = {
  regular: { fontFamily: typography.fontFamily.regular },
  medium: { fontFamily: typography.fontFamily.medium },
  semibold: { fontFamily: typography.fontFamily.semibold },
  bold: { fontFamily: typography.fontFamily.bold },
};
