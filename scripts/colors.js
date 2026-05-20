/**
 * colors.js
 * Centralized Color Management System
 */

(function() {
  const Palette = {
    background: {
      primary: '#F5F5F2',
      surface: '#FFFFFF',
      overlay: 'rgba(245, 245, 242, 0.95)',
      overlay_dark: 'rgba(0, 0, 0, 0.8)',
      dim: 'rgba(0, 0, 0, 0.05)',
    },
    text: {
      primary: '#1C1C1B',
      secondary: '#66645E',
      inverse: '#FFFFFF',
      accent: '#A3A199',
    },
    ui: {
      border: 'rgba(0, 0, 0, 0.08)',
      divider: 'rgba(0, 0, 0, 0.05)',
      shadow: 'rgba(0, 0, 0, 0.15)',
      shadow_dark: 'rgba(0, 0, 0, 0.3)',
      input: '#FBFBFA',
    },
    accent: {
      primary: '#A3A199',
      secondary: '#1C1C1B',
      hover: '#1C1C1B',
    },
    semantic: {
      success: '#4A5D23',
      error: '#D35E5E',
      warning: '#B08A2E',
      info: '#4A5D6E',
    },
    hero: {
      title: '#f5e1a6',
    },
    legacy: {
      editorial_bg: '#F5F5F2',
      editorial_white: '#FFFFFF',
      editorial_olive: '#1C1C1B',
      editorial_rose: '#A3A199',
      editorial_gray: '#66645E',
      editorial_light_gray: '#FBFBFA',
    }
  };

  const VariableMap = {
    '--bg-primary': Palette.background.primary,
    '--bg-surface': Palette.background.surface,
    '--bg-overlay': Palette.background.overlay,
    '--bg-overlay-dark': Palette.background.overlay_dark,
    '--bg-dim': Palette.background.dim,
    '--text-primary': Palette.text.primary,
    '--text-secondary': Palette.text.secondary,
    '--text-inverse': Palette.text.inverse,
    '--text-accent': Palette.text.accent,
    '--border-color': Palette.ui.border,
    '--divider-color': Palette.ui.divider,
    '--shadow-color': Palette.ui.shadow,
    '--shadow-dark': Palette.ui.shadow_dark,
    '--input-bg': Palette.ui.input,
    '--accent': Palette.accent.primary,
    '--accent-secondary': Palette.accent.secondary,
    '--accent-hover': Palette.accent.hover,
    '--success': Palette.semantic.success,
    '--error': Palette.semantic.error,
    '--warning': Palette.semantic.warning,
    '--info': Palette.semantic.info,
    '--hero-title-color': Palette.hero.title,
    '--editorial-bg': Palette.legacy.editorial_bg,
    '--editorial-white': Palette.legacy.editorial_white,
    '--editorial-olive': Palette.legacy.editorial_olive,
    '--editorial-rose': Palette.legacy.editorial_rose,
    '--editorial-gray': Palette.legacy.editorial_gray,
    '--editorial-light-gray': Palette.legacy.editorial_light_gray,
  };

  function injectStyles() {
    const styleId = 'global-color-system';
    let styleEl = document.getElementById(styleId);

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    let css = ':root {\n';
    Object.keys(VariableMap).forEach(function(key) {
      css += '  ' + key + ': ' + VariableMap[key] + ';\n';
    });
    css += '}';

    styleEl.textContent = css;
    
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', Palette.background.primary);
    }
  }

  window.SiteColors = Palette;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }
})();
