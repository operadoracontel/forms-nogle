import { APP_PRODUCT, PRODUCT_VALUES } from './constants';

/** Aceita somente a seleção que o servidor derivou do cadastro da marca no ERP. */
export const parseBrandFormContext = (data) => {
    if (!data || Array.isArray(data) || typeof data.brandName !== 'string' || !data.brandName.trim()
        || (data.brandId != null && (!Number.isSafeInteger(data.brandId) || data.brandId < 1))
        || data.productsSource !== 'erp' || typeof data.hasApp !== 'boolean'
        || typeof data.submissionAvailable !== 'boolean' || !Array.isArray(data.contractedProducts)
        || data.contractedProducts.some((product) => !PRODUCT_VALUES.includes(product))
        || (data.expiresAt !== null && (typeof data.expiresAt !== 'string' || Number.isNaN(Date.parse(data.expiresAt))))) {
        throw new Error('Contexto do formulário indisponível.');
    }
    const contractedProducts = [...new Set(data.contractedProducts)];
    if (data.hasApp !== contractedProducts.includes(APP_PRODUCT)) throw new Error('Contexto do aplicativo inconsistente.');
    return {
        brandId: data.brandId ?? null, brandName: data.brandName.trim(), expiresAt: data.expiresAt,
        productsSource: 'erp', hasApp: data.hasApp,
        contractedProducts, submissionAvailable: data.submissionAvailable,
    };
};

export const demoBrandFormContext = () => ({
    brandId: null, brandName: 'Nogle Tech', expiresAt: null, productsSource: 'demo',
    hasApp: true, contractedProducts: [APP_PRODUCT], submissionAvailable: false,
});

export const buildSubmissionPayload = (form, context) => {
    const metadata = parseBrandFormContext(context);
    if (!Number.isSafeInteger(metadata.brandId) || metadata.brandId < 1 || form.brandId !== metadata.brandId) {
        throw new Error('Selecione a marca vinculada a este formulário.');
    }
    const payload = {
        brandId: metadata.brandId,
        companyName: metadata.brandName, contactWhatsapp: form.contactWhatsapp,
        products: [...metadata.contractedProducts], productsSource: 'erp',
        primaryColor: form.primaryColor, secondaryColor: form.secondaryColor,
        website: form.website, domainRegistrar: form.domainRegistrar,
        domainLogin: form.domainLogin, domainPassword: form.domainPassword,
        domainNotes: form.domainNotes, phone0800: form.phone0800,
        brandWhatsapp: form.brandWhatsapp,
    };
    if (metadata.hasApp) {
        payload.appEnabled = form.appEnabled !== false;
    }
    if (metadata.hasApp && payload.appEnabled) {
        Object.assign(payload, {
            appName: form.appName, appAddress: form.appAddress,
            appColorOne: form.appColorOne, appColorTwo: form.appColorTwo,
            appIconBackgroundColor: form.appIconBackgroundColor || form.appColorOne,
            appCustomSplash: Boolean(form.appCustomSplash),
            appSplashColor: form.appCustomSplash ? form.appSplashColor || form.appColorOne : null,
            appShortDescription: form.appShortDescription,
            appLongDescription: form.appLongDescription,
        });
    }
    return payload;
};

export const buildSubmissionFormData = (form, context) => {
    const formData = new FormData();
    formData.append('payload', JSON.stringify(buildSubmissionPayload(form, context)));
    if (form.logo) formData.append('logo', form.logo);
    if (form.brandManual) formData.append('brandManual', form.brandManual);
    if (context.hasApp && form.appEnabled !== false) {
        if (form.appLogo) formData.append('appLogo', form.appLogo);
        if (form.appLauncherIcon) formData.append('appLauncherIcon', form.appLauncherIcon);
        if (form.appCustomSplash && form.appSplashImage) formData.append('appSplashImage', form.appSplashImage);
    }
    return formData;
};
