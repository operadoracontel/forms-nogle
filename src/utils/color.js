import { HEX_COLOR } from './format';

export const isValidHex = (value) => HEX_COLOR.test(String(value || '').trim());

const expandHex = (hex) => {
    const clean = String(hex || '').replace('#', '');

    if (clean.length === 3) {
        return clean.split('').map((char) => char + char).join('');
    }

    return clean;
};

export const hexToRgb = (hex) => {
    const clean = expandHex(hex);

    return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16),
    };
};

// Luminância relativa (WCAG) — decide se o texto por cima fica preto ou branco.
export const relativeLuminance = (hex) => {
    const { r, g, b } = hexToRgb(hex);

    const channel = (value) => {
        const scaled = value / 255;
        return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
    };

    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

export const contrastRatio = (foreground, background) => {
    const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
    const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));

    return (lighter + 0.05) / (darker + 0.05);
};

// Texto legível sobre a cor escolhida pelo cliente — sem isso o preview mente
// (branco sobre amarelo parece ok no código e some na tela).
export const readableTextOn = (hex) => {
    if (!isValidHex(hex)) {
        return '#FFFFFF';
    }

    return relativeLuminance(hex) > 0.45 ? '#111111' : '#FFFFFF';
};

export const withAlpha = (hex, alpha) => {
    if (!isValidHex(hex)) {
        return `rgba(255,255,255,${alpha})`;
    }

    const { r, g, b } = hexToRgb(hex);

    return `rgba(${r},${g},${b},${alpha})`;
};
