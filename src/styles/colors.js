// src/styles/colors.js
// Paleta base (raw). As cores que mudam entre light/dark (background, surface,
// primary, secondary, textPrimary...) são definidas como SEMANTIC TOKENS em
// theme.js — por isso não ficam aqui, para não conflitarem com os tokens.
export const colors = {
    // Marca (referência fixa, para usos pontuais que não dependem do modo)
    brand: {
        neon: '#02EA75',      // Verde neon Nogle
        neonHover: '#02d066', // Neon hover/pressed
        darkGreen: '#021E00', // Verde escuro
        bege: '#F2EDDA',      // Bege
    },

    // Tons neutros e de contraste
    white: '#FFFFFF',
    beige: '#F2EDDA',
    gray: {
        100: '#E2E8F0',
        200: '#CBD5E0',
        300: '#A0AEC0',
        400: '#718096',
        500: '#4A5568',
        600: '#2D3748',
        700: '#1A202C',
        800: '#171923',
        900: '#0F0F0F',
    },

    red: '#E53E3E',
    green: '#02BD6D',
    blue: '#3182CE',
    yellow: '#ECC94B',

    transparent: 'transparent',
    current: 'currentColor',
};
