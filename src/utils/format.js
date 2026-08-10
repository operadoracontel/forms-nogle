export const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

// (51) 99707-9001 / (51) 3025-9001 — corta em 11 dígitos (DDD + 9)
export const maskPhone = (value) => {
    const digits = onlyDigits(value).slice(0, 11);

    if (digits.length <= 2) {
        return digits;
    }

    if (digits.length <= 6) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

// 0800 123 4567
export const mask0800 = (value) => {
    const digits = onlyDigits(value).slice(0, 11);

    if (digits.length <= 4) {
        return digits;
    }

    if (digits.length <= 7) {
        return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }

    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
};

export const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const normalizeHex = (value) => {
    const raw = String(value || '').trim();

    if (raw === '') {
        return '';
    }

    const withHash = raw.startsWith('#') ? raw : `#${raw}`;

    return withHash.toUpperCase();
};

export const isSameHex = (a, b) => {
    const expand = (hex) => {
        const clean = String(hex || '').replace('#', '').toUpperCase();

        if (clean.length === 3) {
            return clean.split('').map((char) => char + char).join('');
        }

        return clean;
    };

    const first = expand(a);
    const second = expand(b);

    return first !== '' && first === second;
};

export const formatFileSize = (bytes) => {
    if (!bytes) {
        return '';
    }

    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
