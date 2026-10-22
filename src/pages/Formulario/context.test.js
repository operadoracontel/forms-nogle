import { INITIAL_FORM } from './constants';
import { buildSubmissionFormData, buildSubmissionPayload, demoBrandFormContext, parseBrandFormContext } from './context';
import { validateAll, validateStep } from './validation';

const context = (hasApp = false) => ({
    brandId: 75, brandName: 'Marca de teste', expiresAt: null, productsSource: 'erp', hasApp,
    contractedProducts: hasApp ? ['Site Web', 'Aplicativo Mobile'] : ['Site Web'],
    submissionAvailable: false,
});

test('aceita contexto ERP explícito, deduplica categorias e aceita lista vazia real', () => {
    expect(parseBrandFormContext({ ...context(), contractedProducts: ['Site Web', 'Site Web'] }).contractedProducts).toEqual(['Site Web']);
    expect(parseBrandFormContext({ ...context(), contractedProducts: [] }).contractedProducts).toEqual([]);
    expect(parseBrandFormContext(context(true)).hasApp).toBe(true);
    expect(parseBrandFormContext(context()).brandId).toBe(75);
});

test('brandId é opcional para versões anteriores, mas só aceita inteiro JSON positivo e seguro', () => {
    const legacy = { ...context() };
    delete legacy.brandId;
    expect(parseBrandFormContext(legacy).brandId).toBeNull();
    expect(parseBrandFormContext({ ...context(), brandId: null }).brandId).toBeNull();
    for (const invalid of [0, -1, 1.5, '75', true, {}, [], NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
        expect(() => parseBrandFormContext({ ...context(), brandId: invalid })).toThrow();
    }
    expect(demoBrandFormContext()).toMatchObject({ brandId: null, hasApp: true, contractedProducts: ['Aplicativo Mobile'], submissionAvailable: false });
});

test('payload exige a marca vinculada ao token e sempre usa seu nome canônico do ERP', () => {
    const form = { ...INITIAL_FORM, brandId: 75, companyName: 'Nome editado' };
    expect(buildSubmissionPayload(form, context())).toMatchObject({ brandId: 75, companyName: 'Marca de teste' });
    for (const brandId of [999, null, undefined, '75', -1]) {
        expect(() => buildSubmissionPayload({ ...form, brandId }, context())).toThrow('Selecione a marca vinculada');
    }
    const legacy = { ...context() };
    delete legacy.brandId;
    expect(() => buildSubmissionPayload(form, legacy)).toThrow('Selecione a marca vinculada');
    expect(() => buildSubmissionPayload(form, { ...context(), brandId: -1 })).toThrow();
});

test('não usa products legado como seleção e rejeita metadados ambíguos ou incoerentes', () => {
    const invalid = [
        { brandName: 'Marca', products: ['Aplicativo Mobile'], expiresAt: null },
        { ...context(), productsSource: 'manual' },
        { ...context(), hasApp: 'false' },
        { ...context(), contractedProducts: ['Produto inventado'] },
        { ...context(), contractedProducts: ['Aplicativo Mobile'] },
        { ...context(true), contractedProducts: ['Site Web'] },
        { ...context(), submissionAvailable: undefined },
        { ...context(), expiresAt: 'data inválida' },
    ];
    invalid.forEach((data) => expect(() => parseBrandFormContext(data)).toThrow());
});

test('básico não exige escolha de produtos e App só valida quando o ERP indica', () => {
    const form = { ...INITIAL_FORM, brandId: 75, companyName: 'Marca', contactWhatsapp: '51999999999' };
    expect(validateStep('basico', form, false)).toEqual({});
    expect(validateStep('basico', { ...form, brandId: null }, false)).toMatchObject({ companyName: expect.any(String) });
    expect(validateAll(form, false)).toEqual({});
    expect(validateStep('identidade', form, true)).toEqual({});
    expect(validateStep('identidade', { ...form, appEnabled: true }, true)).toMatchObject({ appName: expect.any(String), appAddress: expect.any(String), appColorOne: expect.any(String) });
    expect(validateAll({ ...form, products: ['Aplicativo Mobile'] }, false)).toEqual({});
});

test('payload ignora seleção editável e omite todos os campos App se hasApp=false', () => {
    const form = { ...INITIAL_FORM, brandId: 75, products: ['Notify', 'Aplicativo Mobile'], appName: 'Não enviar' };
    const payload = buildSubmissionPayload(form, context());
    expect(payload.products).toEqual(['Site Web']);
    expect(payload.productsSource).toBe('erp');
    expect(payload).not.toHaveProperty('appName');
    expect(payload).not.toHaveProperty('appAddress');
    expect(payload).not.toHaveProperty('appColorOne');
    expect(payload).not.toHaveProperty('appLongDescription');
});

test('payload com App preserva os campos, e multipart conserva logo/manual sem renomear', () => {
    const logo = new File(['logo'], 'marca.png', { type: 'image/png' });
    const manual = new File(['manual'], 'identidade.pdf', { type: 'application/pdf' });
    const form = { ...INITIAL_FORM, appEnabled: true, brandId: 75, appName: 'Minha marca', appAddress: 'Endereço de teste', appColorOne: '#123456', appColorTwo: '#ffffff', appShortDescription: 'Curta', appLongDescription: 'Longa', logo, brandManual: manual };
    const multipart = buildSubmissionFormData(form, context(true));
    const payload = JSON.parse(multipart.get('payload'));
    expect(payload.products).toEqual(['Site Web', 'Aplicativo Mobile']);
    expect(payload).toMatchObject({ appName: form.appName, appAddress: form.appAddress, appColorOne: form.appColorOne, appColorTwo: form.appColorTwo, appShortDescription: 'Curta', appLongDescription: 'Longa' });
    expect(multipart.get('logo')).toBe(logo);
    expect(multipart.get('brandManual')).toBe(manual);
});

test('assets e cores do App seguem hasApp e a opção de splash no multipart', () => {
    const appLogo = new File(['logo'], 'app.svg', { type: 'image/svg+xml' });
    const appLauncherIcon = new File(['icon'], 'icon.png', { type: 'image/png' });
    const appSplashImage = new File(['splash'], 'splash.jpg', { type: 'image/jpeg' });
    const form = { ...INITIAL_FORM, appEnabled: true, brandId: 75, appColorOne: '#123456', appLogo, appLauncherIcon, appSplashImage, appSplashColor: '#abcdef' };
    const regular = buildSubmissionFormData(form, context(true));
    expect(regular.get('appLogo')).toBe(appLogo);
    expect(regular.get('appLauncherIcon')).toBe(appLauncherIcon);
    expect(regular.has('appSplashImage')).toBe(false);
    expect(JSON.parse(regular.get('payload'))).toMatchObject({ appIconBackgroundColor: '#123456', appCustomSplash: false, appSplashColor: null });
    const custom = buildSubmissionFormData({ ...form, appCustomSplash: true }, context(true));
    expect(custom.get('appSplashImage')).toBe(appSplashImage);
    expect(JSON.parse(custom.get('payload')).appSplashColor).toBe('#abcdef');
    const noApp = buildSubmissionFormData({ ...form, appCustomSplash: true }, context());
    ['appLogo', 'appLauncherIcon', 'appSplashImage'].forEach((key) => expect(noApp.has(key)).toBe(false));
    expect(Object.keys(JSON.parse(noApp.get('payload'))).some((key) => key.startsWith('app'))).toBe(false);
});

test('valida contraste, fundos e formatos apenas no App contratado e splash ativa', () => {
    const form = { ...INITIAL_FORM, appEnabled: true, appName: 'Marca', appAddress: 'Rua de teste', appColorOne: '#123456', primaryColor: '#123456', appShortDescription: 'Curta', appLongDescription: 'Longa' };
    expect(validateStep('identidade', form, true)).toEqual({});
    const invalid = { ...form, appColorTwo: '', appIconBackgroundColor: 'azul', appSplashColor: 'verde', appLauncherIcon: new File(['x'], 'icon.jpg', { type: 'image/jpeg' }) };
    expect(validateStep('identidade', invalid, true)).toMatchObject({ appColorTwo: expect.any(String), appIconBackgroundColor: expect.any(String), appLauncherIcon: expect.any(String) });
    expect(validateStep('identidade', invalid, true)).not.toHaveProperty('appSplashColor');
    expect(validateStep('identidade', { ...invalid, appCustomSplash: true }, true)).toHaveProperty('appSplashColor');
    expect(validateStep('identidade', invalid, false)).toEqual({});
});

test('App desativado suspende validação e omite campos e anexos, mantendo contratação ERP', () => {
    const form = { ...INITIAL_FORM, brandId: 75, appEnabled: false, appColorOne: 'inválida', appLogo: new File(['x'], 'logo.png', { type: 'image/png' }), appLauncherIcon: new File(['x'], 'icon.png', { type: 'image/png' }), appCustomSplash: true, appSplashImage: new File(['x'], 'splash.png', { type: 'image/png' }) };
    expect(validateStep('identidade', form, true)).toEqual({});
    const data = buildSubmissionFormData(form, context(true));
    const payload = JSON.parse(data.get('payload'));
    expect(payload.appEnabled).toBe(false);
    expect(payload.products).toContain('Aplicativo Mobile');
    expect(Object.keys(payload).filter((key) => key.startsWith('app'))).toEqual(['appEnabled']);
    ['appLogo', 'appLauncherIcon', 'appSplashImage'].forEach((key) => expect(data.has(key)).toBe(false));
    expect(validateStep('identidade', { ...form, appEnabled: true }, true)).toHaveProperty('appColorOne');
});
