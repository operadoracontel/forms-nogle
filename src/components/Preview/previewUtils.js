export const normalizeColor = (value, fallback = '#1455e8') => {
    const color = String(value || '').trim();
    if (/^#[0-9a-f]{6}$/i.test(color)) return color.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(color)) return `#${color.slice(1).split('').map((c) => c + c).join('')}`.toLowerCase();
    return fallback;
};

const getLuminance = (value) => {
    const color = normalizeColor(value);
    const channels = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16) / 255)
        .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

export const getContrastRatio = (first, second) => {
    const a = getLuminance(first);
    const b = getLuminance(second);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

// WCAG relative luminance: choose the foreground with the stronger contrast.
export const getContrastColor = (value) => {
    const luminance = getLuminance(value);
    // Luminance of #111827, the actual dark foreground used by the previews.
    const darkLuminance = 0.009189219295824108;
    return (luminance + 0.05) / (darkLuminance + 0.05) > 1.05 / (luminance + 0.05) ? '#111827' : '#ffffff';
};
