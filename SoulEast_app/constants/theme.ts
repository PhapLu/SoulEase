import { Platform, TextStyle, ViewStyle } from 'react-native';

/**
 * 1. PALETTE 
 */
export const palette = {
  // Brand (Mint)
  primary: '#47C1A4',
  primaryDark: '#0A8769', 
  primaryHover: '#44BEA1',   
  primaryAlt: '#40BEA0', 
  primaryAlt2: '#53BDAA', 

  // Base
  white: '#FFFFFF',
  black: '#292929',

  // Neutral / Gray Scale
  gray50:  '#FCFCFC', 
  gray100: '#F5FAF8',       
  gray200: '#E8E8E8',        
  gray300: '#D9D9D9',        
  gray500: '#8A8A8A',        
  gray800: '#1C1C1E',
  border:  '#E5E7EB',

  // Backgrounds theo figma/web
  bg: '#FFFAFD',  
  bgGreen: '#E1F9F5', 
  bgMint: '#e7f7f3ff',

  // Status
  error: '#C03744', 
  errorAlt: '#EF4444', 
  warning: '#EDA145',

  // Shadow Color
  shadow: '#000000',
};



/**
 * 2. COLORS 
 */
export const Colors = {
  light: {
    text: palette.black,
    textSecondary: palette.gray500,

    background: palette.bgMint,
    backgroundSecondary: palette.gray50,

    tint: palette.primary,

    icon: palette.gray500,
    tabIconDefault: palette.gray500,
    tabIconSelected: palette.primary,

    border: palette.gray200,
    error: palette.error,

    tabbarBackground: palette.primary,
    tabbarActive: palette.white,
    tabbarInactive: palette.white,
  },

  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',

    background: '#151718',
    backgroundSecondary: palette.gray800,

    tint: palette.primaryAlt, 

    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: palette.primaryAlt,

    border: '#2C2C2E',
    error: palette.error,

    tabbarBackground: '#1C1C1E',
    tabbarActive: palette.primaryAlt,
    tabbarInactive: '#9BA1A6',
  },
};



/**
 * 3. SPACING 
 */
export const Spacing = {
  xxs: 2,   // 0.25rem
  xs: 4,    // 0.375rem -> 4px
  s: 6,     // 0.5rem -> 6px
  sm: 10,   // 0.75rem -> 10px
  m: 14,    // 1rem -> 14px
  base: 16, // Base 16px
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
  sheet: 32, 
  pill: 999,
};

/**
 * 5. SHADOWS 
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
 * 6. TYPOGRAPHY 
 */
const FontFamilies = Platform.select({
  ios: { sans: 'Manrope', display: 'LobsterTwo' },
  android: { sans: 'Manrope-Regular', display: 'LobsterTwo-Regular' },
  default: { sans: 'Manrope, sans-serif', display: 'Lobster Two, cursive' },
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