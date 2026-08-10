import { onlyDigits, HEX_COLOR, isSameHex } from '../../utils/format';
import { APP_PRODUCT } from './constants';

// Espelha a validação do Cartman (src/middlewares/brandFormMiddleware.js).
// O backend continua sendo a autoridade — aqui é só para o cliente saber o que
// falta antes de tentar enviar.

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

    if (!isFilled(form.companyName)) {
        errors.companyName = 'Informe o nome da sua empresa ou marca.';
    }

    const contact = onlyDigits(form.contactWhatsapp);

    if (!contact) {
        errors.contactWhatsapp = 'Informe o WhatsApp do responsável.';
    } else if (contact.length < 10 || contact.length > 13) {
        errors.contactWhatsapp = 'WhatsApp inválido. Use DDD + número.';
    }

    if (!form.products || form.products.length === 0) {
        errors.products = 'Selecione ao menos um produto contratado.';
    }

    return errors;
};

const validateIdentidade = (form) => {
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

    return errors;
};

const validateDominio = () => ({});

const validateContatos = (form) => {
    const errors = {};

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

const validateApp = (form) => {
    const errors = {};

    if (!form.products?.includes(APP_PRODUCT)) {
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
    } else if (isSameHex(form.appColorOne, form.primaryColor)) {
        errors.appColorOne = 'A cor do app não pode ser a mesma da sua logo — o app fica sem contraste.';
    }

    if (isFilled(form.appColorTwo) && !HEX_COLOR.test(String(form.appColorTwo).trim())) {
        errors.appColorTwo = 'Use o formato HEX (ex: #FF5500).';
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
    contatos: validateContatos,
    app: validateApp,
};

export const validateStep = (stepId, form) => (VALIDATORS[stepId] ? VALIDATORS[stepId](form) : {});

export const validateAll = (form) =>
    Object.keys(VALIDATORS).reduce(
        (accumulator, stepId) => ({ ...accumulator, ...VALIDATORS[stepId](form) }),
        {}
    );
