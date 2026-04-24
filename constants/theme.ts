// Inventory/constants/theme.ts

/**
 * Design System Theme
 * 
 * This file re-exports the comprehensive design system from /theme
 * for backward compatibility and easy imports throughout the app.
 */

import themeExport from '@/theme';
export { colors, typography, textStyles, spacing, borderRadius, shadows } from '@/theme';
export const theme = themeExport;
export default themeExport;
