/**
 * Modern color theme with gradient backgrounds and enhanced accents
 */

import { Platform } from 'react-native';

export const Colors = {
  // Primary theme colors - Enhanced with gradients and vibrant accents
  primary: {
    lightBlue: '#E0E7FF',       // Slightly deeper light blue
    blue: '#4F46E5',            // More vibrant indigo blue
    darkBlue: '#312E81',        // Richer dark blue
    green: '#10B981',           // Vibrant green
    darkGreen: '#047857',       // Dark green for hover states
    purple: '#A855F7',          // Purple accent
    pink: '#EC4899',            // Pink accent
    orange: '#F97316',          // Orange accent
  },
  
  // Semantic colors - Gradient backgrounds
  background: {
    primary: '#F8FAFC',         // Nearly white background
    secondary: '#E0E7FF',       // Light indigo background
    card: '#FFFFFF',            // Card background with subtle shadow
  },
  
  text: {
    primary: '#0F172A',         // Deep blue-black text
    secondary: '#475569',       // Medium gray text
    light: '#94A3B8',           // Light gray text
    white: '#FFFFFF',
  },
  
  status: {
    success: '#22C55E',         // Brighter green
    warning: '#F59E0B',         // Amber
    error: '#EF4444',           // Red
    info: '#3B82F6',            // Blue
  },
  
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 20,
      elevation: 8,
    },
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
