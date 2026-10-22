export const normalizeBrandName = (name) => String(name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const brandEntries = (brands) => (Array.isArray(brands) ? brands : [])
    .map((brand) => ({ brand, name: normalizeBrandName(brand?.name) }))
    .filter(({ brand, name }) => brand && name);

// Only zero, one, or more than one edit matter for autocomplete suggestions.
const editDistance = (left, right) => {
    if (left === right) return 0;
    if (Math.abs(left.length - right.length) > 1) return 2;

    let leftIndex = 0;
    let rightIndex = 0;
    let edits = 0;
    while (leftIndex < left.length && rightIndex < right.length) {
        if (left[leftIndex] === right[rightIndex]) {
            leftIndex += 1;
            rightIndex += 1;
            continue;
        }
        edits += 1;
        if (edits > 1) return 2;
        if (left.length <= right.length) rightIndex += 1;
        if (left.length >= right.length) leftIndex += 1;
    }
    return edits + Number(leftIndex < left.length || rightIndex < right.length);
};

const fuzzyDistance = (name, query) => Math.min(
    editDistance(name, query),
    editDistance(name.split(' ')[0], query),
);

const uniqueBrand = (entries) => {
    const brandsById = new Map(entries.map(({ brand }) => [brand.id, brand]));
    return brandsById.size === 1 ? entries[0].brand : null;
};

export const filterBrands = (brands, query) => {
    const normalizedQuery = normalizeBrandName(query);
    if (!normalizedQuery) return Array.isArray(brands) ? [...brands] : [];

    return brandEntries(brands)
        .map((entry, index) => {
            const { name } = entry;
            let rank = Infinity;
            if (name === normalizedQuery) rank = 0;
            else if (name.startsWith(normalizedQuery)) rank = 1;
            else if (name.includes(normalizedQuery)) rank = 2;
            else if (normalizedQuery.length >= 4 && fuzzyDistance(name, normalizedQuery) <= 1) rank = 3;
            return { ...entry, index, rank };
        })
        .filter(({ rank }) => Number.isFinite(rank))
        .sort((left, right) => left.rank - right.rank || left.index - right.index)
        .map(({ brand }) => brand);
};

export const resolveBrandSelection = (brands, query) => {
    const normalizedQuery = normalizeBrandName(query);
    if (!normalizedQuery) return null;
    const entries = brandEntries(brands);

    const exactMatches = entries.filter(({ name }) => name === normalizedQuery);
    if (exactMatches.length) return uniqueBrand(exactMatches);

    if (normalizedQuery.length >= 3) {
        const prefixMatches = entries.filter(({ name }) => name.startsWith(normalizedQuery));
        if (prefixMatches.length) return uniqueBrand(prefixMatches);
    }
    if (normalizedQuery.length < 4) return null;

    const fuzzyMatches = entries
        .map((entry) => ({ ...entry, distance: fuzzyDistance(entry.name, normalizedQuery) }))
        .filter(({ distance }) => distance <= 1);
    const bestDistance = Math.min(...fuzzyMatches.map(({ distance }) => distance));
    return uniqueBrand(fuzzyMatches.filter(({ distance }) => distance === bestDistance));
};
