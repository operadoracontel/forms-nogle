import { APP_ASSET_MAX_SIZE, readImageDimensions, validateAppAsset } from './appAssets';

test('arquivos do app respeitam formatos por finalidade e limite de 20MB', () => {
    expect(validateAppAsset({ type: 'image/svg+xml', size: 30 }, 'logo')).toBeNull();
    expect(validateAppAsset({ type: 'image/svg+xml', size: 30 }, 'icon')).toContain('PNG');
    expect(validateAppAsset({ type: 'image/png', size: APP_ASSET_MAX_SIZE }, 'icon')).toBeNull();
    expect(validateAppAsset({ type: 'image/png', size: APP_ASSET_MAX_SIZE + 1 }, 'splash')).toContain('20MB');
    expect(validateAppAsset({ type: 'application/pdf', size: 30 }, 'logo')).toContain('PNG, SVG ou JPG');
});

describe('decodificação das imagens locais', () => {
    let instances;
    let OriginalImage;
    beforeEach(() => {
        instances = [];
        OriginalImage = global.Image;
        global.Image = class { constructor() { instances.push(this); } };
        URL.createObjectURL = jest.fn(() => 'blob:local');
        URL.revokeObjectURL = jest.fn();
    });
    afterEach(() => { global.Image = OriginalImage; });
    test('retorna dimensões reais e libera a URL', async () => {
        const promise = readImageDimensions(new File(['x'], 'icon.png'));
        Object.assign(instances[0], { naturalWidth: 512, naturalHeight: 512 });
        instances[0].onload();
        await expect(promise).resolves.toEqual({ width: 512, height: 512 });
        expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
        expect(instances[0].onerror).toBeNull();
    });
    test('arquivo indecodificável informa erro e libera a URL', async () => {
        const promise = readImageDimensions(new File(['x'], 'icon.png'));
        instances[0].onerror();
        await expect(promise).rejects.toThrow('Não foi possível abrir a imagem');
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:local');
    });
    test('cancelamento aborta a imagem e limpa os callbacks e a URL', async () => {
        const controller = new AbortController();
        const promise = readImageDimensions(new File(['x'], 'icon.png'), controller.signal);
        controller.abort();
        await expect(promise).rejects.toHaveProperty('name', 'AbortError');
        expect(instances[0].src).toBe('');
        expect(instances[0].onload).toBeNull();
        expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    });
});
