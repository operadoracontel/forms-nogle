export const APP_ASSET_TYPES = {
    logo: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
    icon: ['image/png'],
    splash: ['image/png', 'image/jpeg', 'image/jpg'],
};
export const APP_ASSET_MAX_SIZE = 20 * 1024 * 1024;

export const validateAppAsset = (file, kind) => {
    if (!file) return null;
    if (!APP_ASSET_TYPES[kind]?.includes(file.type)) {
        return kind === 'icon' ? 'O ícone deve ser um arquivo PNG.'
            : kind === 'logo' ? 'Use PNG, SVG ou JPG para o logo do aplicativo.' : 'Use PNG ou JPG para a splash.';
    }
    return file.size > APP_ASSET_MAX_SIZE ? 'O arquivo excede o tamanho máximo de 20MB.' : null;
};

// Decodifica somente uma URL local. O abort e todos os resultados revogam o blob.
export const readImageDimensions = (file, signal) => new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    let settled = false;
    const finish = (error, dimensions) => {
        if (settled) return;
        settled = true;
        image.onload = null;
        image.onerror = null;
        signal?.removeEventListener('abort', abort);
        URL.revokeObjectURL(url);
        if (error) reject(error); else resolve(dimensions);
    };
    const abort = () => {
        finish(Object.assign(new Error('Leitura cancelada.'), { name: 'AbortError' }));
        image.src = '';
    };
    image.onload = () => finish(null, { width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => finish(new Error('Não foi possível abrir a imagem. Escolha outro arquivo.'));
    if (signal?.aborted) { abort(); return; }
    signal?.addEventListener('abort', abort, { once: true });
    image.src = url;
});
