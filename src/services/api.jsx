import axios from 'axios';

/**
 * Cliente HTTP do formulário. Todas as chamadas à API vivem aqui — nenhuma tela
 * monta URL própria.
 *
 * O backend é o Cartman (`REACT_APP_API_URL`). Contrato completo de cada rota em
 * `docs/04-backend-e-api.md`.
 *
 * Dois grupos:
 *   • Públicas  — o cliente da marca acessa pelo token opaco do link. Sem login.
 *   • Internas  — exigem Bearer JWT; as de `domain-access` exigem admin.
 */
const Api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

// Mesma chave usada pelos outros fronts da Nogle (monitor, schedule). O formulário
// não faz login, então normalmente não há token — o interceptor só anexa quando
// existe, para o caso de uma tela interna passar a consumir as rotas autenticadas.
const TOKEN_KEY = '@ScheduleNogleApp:token';

export const getStoredToken = () =>
    sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || null;

Api.interceptors.request.use((config) => {
    const token = getStoredToken();

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ─── Rotas públicas (token do link) ──────────────────────────────────────────

/** GET /brand-form/:token — resolve o link e devolve nome da marca e produtos. */
export const getBrandForm = (token) => Api.get(`/brand-form/${encodeURIComponent(token)}`);

/** POST /brand-form/:token — envia a resposta. `formData` com `payload`, `logo`, `brandManual`. */
export const submitBrandForm = (token, formData) =>
    Api.post(`/brand-form/${encodeURIComponent(token)}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// ─── Rotas internas (Bearer JWT) ─────────────────────────────────────────────

/**
 * GET /brand-form/brand/:brandId — tudo que a marca respondeu.
 * `brandId` é o `id_FRANQUIA_MARCA_PROPRIA`.
 * Não devolve senha nem login do domínio, só o booleano `tem_acesso_dominio`.
 * Resposta: `{ status: 'CONCLUIDO' | 'PENDENTE' | 'SEM_LINK', onboarding }`.
 */
export const getBrandOnboarding = (brandId) =>
    Api.get(`/brand-form/brand/${encodeURIComponent(brandId)}`);

/**
 * GET /brand-form/brand/:brandId/domain-access — acesso ao painel do domínio, com a
 * senha decifrada. **Exige admin.** Cada leitura fica registrada na auditoria.
 */
export const getBrandDomainAccess = (brandId) =>
    Api.get(`/brand-form/brand/${encodeURIComponent(brandId)}/domain-access`);

/**
 * DELETE /brand-form/brand/:brandId/domain-access — apaga a senha depois do domínio
 * apontado. Idempotente. **Exige admin.**
 */
export const purgeBrandDomainPassword = (brandId) =>
    Api.delete(`/brand-form/brand/${encodeURIComponent(brandId)}/domain-access`);

// ─── Normalização de erro ────────────────────────────────────────────────────

/**
 * A API devolve `reason` (NOT_FOUND | EXPIRED | ALREADY_SUBMITTED) nos estados de
 * bloqueio e `errors` (array de mensagens) na validação de campos.
 */
export const extractReason = (error) => {
    const status = error?.response?.status;
    const reason = error?.response?.data?.reason;

    if (reason) {
        return reason;
    }

    if (status === 401) {
        return 'UNAUTHORIZED';
    }

    if (status === 403) {
        return 'FORBIDDEN';
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

    if (status === 413) {
        return 'TOO_LARGE';
    }

    if (status === 429) {
        return 'RATE_LIMITED';
    }

    return 'UNKNOWN';
};

/** Segundos até poder tentar de novo, quando a API responde 429. */
export const extractRetryAfter = (error) => {
    const header = error?.response?.headers?.['retry-after'];
    const seconds = Number(header);

    return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
};

export const extractErrors = (error) => {
    const errors = error?.response?.data?.errors;

    if (Array.isArray(errors) && errors.length > 0) {
        return errors;
    }

    return [error?.response?.data?.message || 'Não foi possível enviar o formulário. Tente novamente.'];
};

export default Api;
