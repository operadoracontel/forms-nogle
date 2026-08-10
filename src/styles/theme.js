// src/styles/theme.js
import { extendTheme } from '@chakra-ui/react';
import { nogletheme } from '@nogle/ui';
import { colors } from './colors';

/**
 * Tema Nogle — identidade visual oficial.
 *
 * A base é o `nogletheme` do @nogle/ui (design system). Sobre ele aplicamos os
 * SEMANTIC TOKENS que dão suporte a light/dark — o tema da lib ainda é dark-only,
 * então estes overrides são o que garante contraste correto nos dois modos.
 * Quando o @nogle/ui passar a expor os semantic tokens, este arquivo encolhe.
 *
 *   Neon Green  #02EA75  → tecnologia / energia / AÇÕES e destaques
 *   Dark Green  #021E00  → solidez / confiança (texto sobre o neon)
 *   Bege        #F2EDDA  → humanização (fundo do light)
 *
 * Componentes devem usar tokens (`surface`, `textPrimary`, `borderPrimary`,
 * `secondary`…) em vez de cores fixas.
 */

const config = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
};

const fonts = {
    heading: `'Plus Jakarta Sans', sans-serif`,
    body: `'Plus Jakarta Sans', sans-serif`,
};

// ─── Semantic Tokens (fonte única da verdade para light/dark) ──────────────────
const semanticTokens = {
    colors: {
        background: { default: '#F2EDDA', _dark: '#0C0C0C' },
        bgSecondary: { default: '#FFFFFF', _dark: '#111113' },
        surface: { default: '#FFFFFF', _dark: '#1A1A1A' },
        surfaceRaised: { default: '#F6F3E7', _dark: '#202024' },
        surfaceHover: { default: 'rgba(0,19,0,0.05)', _dark: 'rgba(255,255,255,0.05)' },
        overlayBg: { default: 'rgba(0,19,0,0.45)', _dark: 'rgba(0,0,0,0.66)' },

        textPrimary: { default: '#021E00', _dark: '#FFFFFF' },
        textSecondary: { default: '#4A5A4A', _dark: '#A0A3A8' },
        textMuted: { default: '#6B746B', _dark: '#6B6E74' },

        borderPrimary: { default: '#B3AB93', _dark: '#27272B' },
        borderSubtle: { default: 'rgba(0,19,0,0.16)', _dark: 'rgba(255,255,255,0.07)' },

        primary: { default: '#021E00', _dark: '#021E00' },
        secondary: { default: '#02EA75', _dark: '#02EA75' },
        secondaryHover: { default: '#02d066', _dark: '#02d066' },
        secondarySubtle: { default: 'rgba(2,234,117,0.14)', _dark: 'rgba(2,234,117,0.10)' },

        danger: { default: '#E53E3E', _dark: '#FC8181' },
        dangerSubtle: { default: 'rgba(229,62,62,0.10)', _dark: 'rgba(252,129,129,0.12)' },
        warning: { default: '#B7791F', _dark: '#ECC94B' },
        info: { default: '#2B6CB0', _dark: '#63B3ED' },
    },
};

// ─── Estilos globais ──────────────────────────────────────────────────────────
const styles = {
    global: (props) => {
        const dark = props.colorMode === 'dark';
        return {
            'html, body, #root': {
                bg: 'background',
                color: 'textPrimary',
            },
            body: {
                fontFamily: `'Plus Jakarta Sans', sans-serif`,
                fontSize: '15px',
                transition: 'background-color 0.2s ease, color 0.2s ease',
                // iOS: evita zoom automático ao focar input com fonte < 16px
                WebkitTextSizeAdjust: '100%',
            },
            '::placeholder': { color: 'textMuted' },
            '::-webkit-scrollbar': { width: '8px', height: '8px' },
            '::-webkit-scrollbar-track': { background: 'transparent' },
            '::-webkit-scrollbar-thumb': {
                background: dark ? '#27272B' : '#B3AB93',
                borderRadius: '10px',
            },
            '::-webkit-scrollbar-thumb:hover': { background: dark ? '#02EA75' : '#02d066' },
            '::selection': { background: dark ? 'rgba(2,234,117,0.30)' : 'rgba(2,234,117,0.25)' },
            "input[type='date'], input[type='time'], input[type='color']": {
                colorScheme: dark ? 'dark' : 'light',
            },
            option: {
                background: dark ? '#1A1A1A' : '#ffffff',
                color: dark ? '#ffffff' : '#000000',
            },
        };
    },
};

// ─── Overrides de componentes ─────────────────────────────────────────────────
const components = {
    Button: {
        baseStyle: { borderRadius: 'lg', fontWeight: 700 },
        variants: {
            solid: {
                bg: 'secondary',
                color: 'primary',
                _hover: { bg: 'secondaryHover', _disabled: { bg: 'secondary' } },
                _active: { bg: 'secondaryHover' },
            },
            ghost: {
                color: 'textSecondary',
                _hover: { bg: 'surfaceHover', color: 'textPrimary' },
            },
            outline: {
                borderColor: 'borderPrimary',
                color: 'textPrimary',
                _hover: { bg: 'surfaceHover' },
            },
        },
    },
    Input: {
        // O @nogle/ui aplica cor fixa no baseStyle; zeramos e devolvemos por token
        baseStyle: { field: { bg: 'transparent', color: 'inherit', borderColor: 'inherit' } },
        variants: {
            outline: {
                field: {
                    bg: 'surface',
                    color: 'textPrimary',
                    borderColor: 'borderPrimary',
                    _placeholder: { color: 'textMuted' },
                    _hover: { borderColor: 'textMuted' },
                    _focus: { borderColor: 'secondary', boxShadow: 'none' },
                    _invalid: { borderColor: 'danger', boxShadow: 'none' },
                },
            },
        },
        defaultProps: { variant: 'outline' },
    },
    Textarea: {
        variants: {
            outline: {
                bg: 'surface',
                color: 'textPrimary',
                borderColor: 'borderPrimary',
                _placeholder: { color: 'textMuted' },
                _hover: { borderColor: 'textMuted' },
                _focus: { borderColor: 'secondary', boxShadow: 'none' },
                _invalid: { borderColor: 'danger', boxShadow: 'none' },
            },
        },
        defaultProps: { variant: 'outline' },
    },
    Select: {
        variants: {
            outline: {
                field: {
                    bg: 'surface',
                    color: 'textPrimary',
                    borderColor: 'borderPrimary',
                    _focus: { borderColor: 'secondary', boxShadow: 'none' },
                    option: { bg: 'surface', color: 'textPrimary' },
                },
            },
        },
        defaultProps: { variant: 'outline' },
    },
    FormLabel: {
        baseStyle: { color: 'textPrimary', fontWeight: 600, fontSize: 'sm', mb: 2 },
    },
    FormError: {
        baseStyle: { text: { color: 'danger', fontSize: 'sm', fontWeight: 500 } },
    },
    Checkbox: {
        baseStyle: {
            control: {
                borderColor: 'borderPrimary',
                _checked: {
                    bg: 'secondary',
                    borderColor: 'secondary',
                    color: 'primary',
                    _hover: { bg: 'secondaryHover', borderColor: 'secondaryHover' },
                },
            },
            label: { color: 'textPrimary' },
        },
    },
    Modal: {
        baseStyle: {
            overlay: { bg: 'overlayBg', backdropFilter: 'blur(4px)' },
            dialog: {
                bg: 'surface',
                color: 'textPrimary',
                border: '1px solid',
                borderColor: 'borderPrimary',
            },
        },
    },
    Tooltip: {
        baseStyle: { bg: 'surfaceRaised', color: 'textPrimary', borderRadius: 'md' },
    },
    Heading: {
        baseStyle: { color: 'textPrimary' },
    },
    Divider: {
        baseStyle: { borderColor: 'borderPrimary', opacity: 1 },
    },
    Progress: {
        baseStyle: {
            filledTrack: { bg: 'secondary' },
            track: { bg: 'surfaceRaised' },
        },
    },
};

export default extendTheme(
    {
        config,
        styles,
        colors,
        fonts,
        components,
        semanticTokens,
    },
    nogletheme
);
