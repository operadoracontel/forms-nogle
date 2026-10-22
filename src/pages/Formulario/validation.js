import { onlyDigits, HEX_COLOR } from '../../utils/format';
import { validateAppAsset } from '../../utils/appAssets';

// Validação local de campos e assets. A API deve revalidar arquivos e dimensões
// quando o envio for reativado; a validação do cliente não substitui o servidor.

export const LOGO_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
export const MANUAL_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
];
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

const isFilled = (value) => String(value === null || value === undefined ? '' : value).trim() !== '';

const validateBasico = (form) => {
    const errors = {};

    if (!Number.isSafeInteger(form.brandId) || form.brandId <= 0 || !isFilled(form.companyName)) {
        errors.companyName = 'Selecione sua marca na lista de marcas cadastradas.';
    }

    const contact = onlyDigits(form.contactWhatsapp);

    if (!contact) {
        errors.contactWhatsapp = 'Informe o WhatsApp do responsável.';
    } else if (contact.length < 10 || contact.length > 13) {
        errors.contactWhatsapp = 'WhatsApp inválido. Use DDD + número.';
    }

    const phone = onlyDigits(form.phone0800);
    if (phone && (phone.length < 10 || phone.length > 11)) {
        errors.phone0800 = 'Número 0800 inválido.';
    }

    const brandWhatsapp = onlyDigits(form.brandWhatsapp);
    if (brandWhatsapp && (brandWhatsapp.length < 10 || brandWhatsapp.length > 13)) {
        errors.brandWhatsapp = 'WhatsApp inválido. Use DDD + número.';
    }

    return errors;
};

const validateIdentidade = (form, hasApp = false) => {
    const errors = {};

    if (isFilled(form.primaryColor) && !HEX_COLOR.test(String(form.primaryColor).trim())) {
        errors.primaryColor = 'Use o formato HEX (ex: #FF5500).';
    }

    if (isFilled(form.secondaryColor) && !HEX_COLOR.test(String(form.secondaryColor).trim())) {
        errors.secondaryColor = 'Use o formato HEX (ex: #FF5500).';
    }

    if (form.logo) {
        if (!LOGO_MIME_TYPES.includes(form.logo.type)) {
            errors.logo = 'O logo deve ser PNG, JPG ou PDF.';
        } else if (form.logo.size > MAX_FILE_SIZE) {
            errors.logo = 'O logo excede o tamanho máximo de 20MB.';
        }
    }

    if (form.brandManual) {
        if (!MANUAL_MIME_TYPES.includes(form.brandManual.type)) {
            errors.brandManual = 'O manual de marca deve ser PDF, PNG, JPG ou ZIP.';
        } else if (form.brandManual.size > MAX_FILE_SIZE) {
            errors.brandManual = 'O manual de marca excede o tamanho máximo de 20MB.';
        }
    }

    return { ...errors, ...validateApp(form, hasApp) };
};

const validateDominio = () => ({});

const validateApp = (form, hasApp = false) => {
    const errors = {};

    if (!hasApp || form.appEnabled === false) {
        return errors;
    }

    if (!isFilled(form.appName)) {
        errors.appName = 'Informe o nome que será publicado nas lojas.';
    }

    if (!isFilled(form.appAddress)) {
        errors.appAddress = 'Informe o endereço completo da empresa.';
    }

    if (!isFilled(form.appColorOne)) {
        errors.appColorOne = 'Informe a cor primária do aplicativo em HEX.';
    } else if (!HEX_COLOR.test(String(form.appColorOne).trim())) {
        errors.appColorOne = 'Use o formato HEX (ex: #FF5500).';
    }

    if (!isFilled(form.appColorTwo)) {
        errors.appColorTwo = 'Informe a cor de contraste do aplicativo.';
    } else if (!HEX_COLOR.test(String(form.appColorTwo).trim())) {
        errors.appColorTwo = 'Use o formato HEX (ex: #FF5500).';
    }

    if (isFilled(form.appIconBackgroundColor) && !HEX_COLOR.test(String(form.appIconBackgroundColor).trim())) {
        errors.appIconBackgroundColor = 'Use o formato HEX (ex: #FF5500).';
    }
    if (form.appCustomSplash && isFilled(form.appSplashColor) && !HEX_COLOR.test(String(form.appSplashColor).trim())) {
        errors.appSplashColor = 'Use o formato HEX (ex: #FF5500).';
    }
    for (const [field, kind] of [['appLogo', 'logo'], ['appLauncherIcon', 'icon'], ...(form.appCustomSplash ? [['appSplashImage', 'splash']] : [])]) {
        const error = validateAppAsset(form[field], kind);
        if (error) errors[field] = error;
    }

    if (!isFilled(form.appShortDescription)) {
        errors.appShortDescription = 'Informe a descrição curta do aplicativo.';
    }

    if (!isFilled(form.appLongDescription)) {
        errors.appLongDescription = 'Informe a descrição longa do aplicativo.';
    }

    return errors;
};

const VALIDATORS = {
    basico: validateBasico,
    identidade: validateIdentidade,
    dominio: validateDominio,
};

export const validateStep = (stepId, form, hasApp = false) => (VALIDATORS[stepId] ? VALIDATORS[stepId](form, hasApp) : {});

export const validateAll = (form, hasApp = false) =>
    Object.keys(VALIDATORS).reduce(
        (accumulator, stepId) => ({ ...accumulator, ...VALIDATORS[stepId](form, hasApp) }),
        {}
    );
