import axios from 'axios';

// Formulário público: não existe login nem token de sessão. A única credencial é
// o token opaco do link, que vai na própria URL do endpoint.
const Api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

export const getBrandForm = (token) => Api.get(`/brand-form/${encodeURIComponent(token)}`);

export const submitBrandForm = (token, formData) =>
    Api.post(`/brand-form/${encodeURIComponent(token)}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// A API devolve `reason` (NOT_FOUND | EXPIRED | ALREADY_SUBMITTED) nos estados de
// bloqueio e `errors` (array de mensagens) na validação de campos.
export const extractReason = (error) => {
    const status = error?.response?.status;
    const reason = error?.response?.data?.reason;

    if (reason) {
        return reason;
    }

    if (status === 404) {
        return 'NOT_FOUND';
    }

    if (status === 409) {
        return 'ALREADY_SUBMITTED';
    }

    if (status === 410) {
        return 'EXPIRED';
    }

    return 'UNKNOWN';
};

export const extractErrors = (error) => {
    const errors = error?.response?.data?.errors;

    if (Array.isArray(errors) && errors.length > 0) {
        return errors;
    }

    return [error?.response?.data?.message || 'Não foi possível enviar o formulário. Tente novamente.'];
};

export default Api;
