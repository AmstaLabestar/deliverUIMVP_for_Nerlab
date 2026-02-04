export const COLORS = {
  // Primary Orange
  primary: "#FF9500",
  primaryDark: "#E68A00",
  primaryLight: "#FFB84D",

  // Neutrals
  white: "#FFFFFF",
  light: "#F5F5F5",
  gray: "#999999",
  darkGray: "#666666",
  black: "#333333",

  // Status
  success: "#4CAF50",
  danger: "#FF5252",
  warning: "#FFC107",
  info: "#2196F3",

  // Backgrounds
  bgPrimary: "#FFFFFF",
  bgSecondary: "#F5F5F5",
  bgTertiary: "#EEEEEE",

  // Borders
  border: "#E0E0E0",
  borderLight: "#F0F0F0",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
    lineHeight: 34,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700" as const,
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 20,
  },
};

export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};
