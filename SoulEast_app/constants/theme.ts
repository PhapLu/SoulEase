import { Platform, TextStyle, ViewStyle } from 'react-native';

/**
 * 1. PALETTE (Bảng màu gốc)
 */
export const palette = {
  primary: '#12915A', 
  primaryDark: '#0E7448', 
  white: '#FFFFFF',
  black: '#292929',
  
  // Neutral / Gray Scale
  gray100: '#F2F2F7',
  gray200: '#E5E5EA',
  gray300: '#D1D1D6',
  gray500: '#8E8E93',
  gray800: '#1C1C1E',
  
  // Status
  error: '#C03744',
  warning: '#EDA145',
  
  // Shadow Color
  shadow: '#000000', 
};

/**
 * 2. COLORS (Màu theo ngữ nghĩa Light/Dark)
 */
export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: palette.gray500,
    background: palette.white,
    backgroundSecondary: palette.gray100,
    tint: palette.primary,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: palette.primary,
    border: palette.gray200,
    error: palette.error,
    tabbarBackground: palette.primary,
    tabbarActive: palette.white,
    tabbarInactive: palette.white,
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: palette.gray500,
    background: '#151718',
    backgroundSecondary: palette.gray800,
    tint: palette.primaryDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: palette.primaryDark,
    border: palette.gray800,
    error: palette.error,
    tabbarBackground: palette.primaryDark,
    tabbarActive: palette.primaryDark,
    tabbarInactive: palette.gray500,
  },
};

/**
 * 3. SPACING (Khoảng cách)
 */
export const Spacing = {
  xxs: 2,   // 0.25rem
  xs: 4,    // 0.375rem -> 4px
  s: 6,     // 0.5rem -> 6px
  sm: 10,   // 0.75rem -> 10px
  m: 14,    // 1rem -> 14px
  base: 16, // Base chuẩn 16px
  ml: 20,   // 1.5rem -> 20px
  l: 28,    // 2rem -> 28px
  xl: 40,   // 3rem -> 40px
};

/**
 * 4. RADIUS (Bo góc)
 */
export const Radius = {
  sharp: 0,   // 0px
  xxs: 2,     // 2px
  xs: 4,      // 4px
  s: 6,       // 6px
  sm: 8,      // 8px
  m: 12,      // 12px
  ml: 16,     // 16px
  lg: 24,     // 24px
  xl: 36,     // 36px
  round: 999, // 999px
};

/**
 * 5. SHADOWS (Bóng đổ)
 */
export const Shadows = {
  sm: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,
  default: { 
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  } as ViewStyle,
  md: { 
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  } as ViewStyle,
  lg: { 
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  } as ViewStyle,
};

/**
 * 6. TYPOGRAPHY (Font chữ)
 * - Đã cập nhật Font Family thành "Inter"
 */
const FontFamilies = Platform.select({
  ios: {
    sans: 'Inter', // Cần link font Inter-Regular.ttf, Inter-Bold.ttf trong Xcode
    serif: 'Inter', 
  },
  android: {
    sans: 'Inter-Regular', // Tên file font trong android/app/src/main/assets/fonts
    serif: 'Inter-Regular',
  },
  default: {
    sans: 'Inter, sans-serif',
    serif: 'Inter, sans-serif',
  },
});

export const Typography = {
  family: FontFamilies,
  
  // Sizes
  size: {
    xs: 12, 
    s: 14,  
    m: 16,  
    l: 20,  
    xl: 24, 
    xxl: 32, 
    display: 48, 
  },

  // Weights
  weight: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    black: '900' as TextStyle['fontWeight'], 
  },
  
  // Line Heights
  lineHeight: {
    s: 20,
    m: 24,
    l: 30,
  }
};