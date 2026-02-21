/**
 * colors.js
 * Centralized Color Management System
 * 
 * This file is the SINGLE source of truth for all website colors.
 * It automatically injects CSS variables into the document root.
 * 
 * GOAL:
 * - Centralized color definitions
 * - Instant website-wide updates
 * - Scalable for future themes
 */

(function() {
  /**
   * GLOBAL COLOR PALETTE
   * All color values are defined here.
   */
  const Palette = {
    // Primary Background Colors
    background: {
      primary: '#F5F5F2',         // Warm Gallery White (Eggshell)
      surface: '#FFFFFF',         // Pure White (Cards, Inputs, Blocks)
      overlay: 'rgba(245, 245, 242, 0.95)', // Scrolled Nav / Overlays
      overlay_dark: 'rgba(0, 0, 0, 0.8)',   // Modal/Lightbox overlays
      dim: 'rgba(0, 0, 0, 0.05)', // Subtle dark tint for borders/shadows
    },

    // Text & Content Hierarchy
    text: {
      primary: '#1C1C1B',         // Deep Charcoal (Headings, primary body)
      secondary: '#66645E',       // Warm Mid-Grey (Descriptions, metadata)
      inverse: '#FFFFFF',         // White (Text on dark buttons/backgrounds)
      accent: '#A3A199',          // Stone Accent (Categories, tiny labels)
    },

    // UI Elements
    ui: {
      border: 'rgba(0, 0, 0, 0.08)',    // Global border color
      divider: 'rgba(0, 0, 0, 0.05)',   // Ultra-subtle divider
      shadow: 'rgba(0, 0, 0, 0.15)',    // Base shadow color
      shadow_dark: 'rgba(0, 0, 0, 0.3)', // Darker shadow for depth
      input: '#FBFBFA',                 // Slightly off-white for inputs
    },

    // Highlight & Accents
    accent: {
      primary: '#A3A199',         // Stone / Bronze Accent
      secondary: '#1C1C1B',       // Dark Contrast Accent
      hover: '#1C1C1B',           // Hover state for links/buttons
    },

    // Semantic / Functional Colors
    semantic: {
      success: '#4A5D23',         // Muted Green
      error: '#D35E5E',           // Muted Red
      warning: '#B08A2E',         // Muted Gold
      info: '#4A5D6E',            // Muted Steel Blue
    },

    // Compatibility Layer (Legacy variable support)
    legacy: {
      editorial_bg: '#F5F5F2',
      editorial_white: '#FFFFFF',
      editorial_olive: '#1C1C1B',
      editorial_rose: '#A3A199',
      editorial_gray: '#66645E',
      editorial_light_gray: '#FBFBFA',
    }
  };

  /**
   * Variable Mapping
   * Maps internal Palette keys to CSS Variable Names
   */
  const VariableMap = {
    // Backgrounds
    '--bg-primary': Palette.background.primary,
    '--bg-surface': Palette.background.surface,
    '--bg-overlay': Palette.background.overlay,
    '--bg-overlay-dark': Palette.background.overlay_dark,
    '--bg-dim': Palette.background.dim,

    // Text
    '--text-primary': Palette.text.primary,
    '--text-secondary': Palette.text.secondary,
    '--text-inverse': Palette.text.inverse,
    '--text-accent': Palette.text.accent,

    // UI
    '--border-color': Palette.ui.border,
    '--divider-color': Palette.ui.divider,
    '--shadow-color': Palette.ui.shadow,
    '--shadow-dark': Palette.ui.shadow_dark,
    '--input-bg': Palette.ui.input,

    // Accent
    '--accent': Palette.accent.primary,
    '--accent-secondary': Palette.accent.secondary,
    '--accent-hover': Palette.accent.hover,

    // Status
    '--success': Palette.semantic.success,
    '--error': Palette.semantic.error,
    '--warning': Palette.semantic.warning,
    '--info': Palette.semantic.info,

    // Global Compatibility
    '--editorial-bg': Palette.legacy.editorial_bg,
    '--editorial-white': Palette.legacy.editorial_white,
    '--editorial-olive': Palette.legacy.editorial_olive,
    '--editorial-rose': Palette.legacy.editorial_rose,
    '--editorial-gray': Palette.legacy.editorial_gray,
    '--editorial-light-gray': Palette.legacy.editorial_light_gray,
  };

  /**
   * Injects CSS variables into the :root
   */
  function injectStyles() {
    const styleId = 'global-color-system';
    let styleEl = document.getElementById(styleId);

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    let css = ':root {\n';
    for (const [variable, value] of Object.entries(VariableMap)) {
      css += `  ${variable}: ${value};\n`;
    }
    css += '}';

    styleEl.textContent = css;
    
    // Update theme-color meta tag if it exists
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', Palette.background.primary);
    }

    console.log('🎨 Global Color Management System Initialized');
  }

  // Export Palette globally for potential Javascript logic
  window.SiteColors = Palette;

  // Initialize immediately to prevent FOUC (Must be in <head>)
  injectStyles();

})();
