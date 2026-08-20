# Backend e API

O backend é a API **Cartman** (repositório `cartman`, Node 22 + MVC), apontada por
`REACT_APP_API_URL`. O front fala com ela via axios (`src/services/api.jsx`).

Este documento é a **referência completa dos endpoints do formulário**. Toda a
documentação de API do NOGLE-27602 vive aqui, não espalhada pelos outros repositórios.

## Onde fica cada coisa

O **código que executa** as rotas está no Cartman. O **cliente que as chama** está
neste repositório, em `src/services/api.jsx` — nenhuma tela monta URL própria.

| Rota | Função cliente (`src/services/api.jsx`) |
| --- | --- |
| GET `/brand-form/:token` | `getBrandForm(token)` |
| POST `/brand-form/:token` | `submitBrandForm(token, formData)` |
| GET `/brand-form/brand/:brandId` | `getBrandOnboarding(brandId)` |
| GET `/brand-form/brand/:brandId/domain-access` | `getBrandDomainAccess(brandId)` |
| DELETE `/brand-form/brand/:brandId/domain-access` | `purgeBrandDomainPassword(brandId)` |

Auxiliares do mesmo arquivo: `extractReason(error)`, `extractErrors(error)`,
`extractRetryAfter(error)` e `getStoredToken()`.

O interceptor anexa `Authorization: Bearer <jwt>` quando existe token guardado
(`@ScheduleNogleApp:token`, em `sessionStorage` ou `localStorage` — mesma chave dos
outros fronts da Nogle). O formulário em si não faz login, então nas rotas públicas o
header simplesmente não vai. As rotas internas só funcionam com um token válido.

Arquivos no Cartman:

| Arquivo | Papel |
| --- | --- |
| `src/router.js` | Registro das rotas |
| `src/controllers/brandFormController.js` | Request/response |
| `src/middlewares/brandFormMiddleware.js` | Upload, validação e gate de admin |
| `src/modules/brandFormModule.js` | Acesso a dados |
| `src/modules/brandFormCryptoModule.js` | AES-256-GCM da senha do domínio |

---

## Visão geral das rotas

| Método | Rota | Acesso |
| --- | --- | --- |
| GET | `/brand-form/:token` | **Público** |
| POST | `/brand-form/:token` | **Público** |
| GET | `/brand-form/brand/:brandId` | `auth` (JWT) |
| GET | `/brand-form/brand/:brandId/domain-access` | `auth` + **admin** |
| DELETE | `/brand-form/brand/:brandId/domain-access` | `auth` + **admin** |

`:token` é o token opaco do link, gerado no ERP.
`:brandId` é o `id_FRANQUIA_MARCA_PROPRIA`.

As duas primeiras são públicas **de propósito**: quem acessa é o cliente da marca, que
não tem usuário no ERP. O token é a única credencial e vale um envio só.

---

## 1. GET `/brand-form/:token`

Resolve o link e devolve os dados de apresentação. É o que a tela do formulário chama
ao abrir. **Sem autenticação.**

### Resposta `200`

```json
{
  "brandName": "PAFER TESTE",
  "products": ["Site Web", "Aplicativo Mobile", "Link de recarga facil", "Solucao de Vendas", "Notify"],
  "expiresAt": null
}
```

`brandName` já vem preenchido no primeiro campo do formulário. `expiresAt` nulo
significa link sem prazo.

### Erros

| Status | `reason` | Quando |
| --- | --- | --- |
| `404` | `NOT_FOUND` | Token inexistente, `st = 0`, ou status inesperado |
| `409` | `ALREADY_SUBMITTED` | A marca já enviou; vem `submittedAt` |
| `410` | `EXPIRED` | `dtExpiracao_FORMULARIO_MARCA` no passado (30 dias por padrão) |
| `429` | — | Mais de 60 leituras do mesmo IP em 10 minutos; vem `Retry-After` |
| `500` | — | Erro interno (mensagem genérica; detalhe só no log) |

```json
{ "message": "Link do formulario nao encontrado.", "reason": "NOT_FOUND", "status": 404, "submittedAt": null }
```

---

## 2. POST `/brand-form/:token`

Grava a resposta e fecha o link. `multipart/form-data`. **Sem autenticação.**

### Corpo

| Campo | Tipo | Obrigatório | Regras |
| --- | --- | --- | --- |
| `payload` | string (JSON) | sim | Ver tabela abaixo |
| `logo` | arquivo | não | PNG, JPG ou PDF. Máx **20MB** |
| `brandManual` | arquivo | não | PDF, PNG, JPG ou ZIP. Máx **20MB** |

Limites aplicados no multer, antes de bufferizar em memória: 2 arquivos, 10 campos,
256KB por campo de texto, 20MB por arquivo.

O conteúdo do arquivo é conferido por **magic bytes**, não só pelo `Content-Type`
declarado: PNG, JPG e PDF no logo; PNG, JPG, PDF e ZIP no manual.

### Chaves do `payload`

| Chave | Obrigatória | Validação |
| --- | --- | --- |
| `companyName` | **sim** | Não vazio |
| `contactWhatsapp` | **sim** | 10 a 13 dígitos |
| `products` | **sim** | Array, ao menos 1, valores de `AVAILABLE_PRODUCTS` |
| `primaryColor` / `secondaryColor` | não | HEX (`#RGB` ou `#RRGGBB`) |
| `website` | não | Texto livre, até 300 |
| `domainRegistrar` | não | Até 200 |
| `domainLogin` | não | Até 200 |
| `domainPassword` | não | **Cifrada** antes de gravar |
| `domainNotes` | não | Texto longo |
| `phone0800` | não | 10 ou 11 dígitos |
| `brandWhatsapp` | não | 10 a 13 dígitos |
| `appName` | condicional¹ | Até 200 |
| `appAddress` | condicional¹ | Até 400 |
| `appColorOne` | condicional¹ | HEX |
| `appColorTwo` | não | HEX |
| `appShortDescription` | condicional¹ | Até 400 |
| `appLongDescription` | condicional¹ | Texto longo |

¹ Obrigatórios **apenas** quando `products` inclui `"Aplicativo Mobile"`.

> **Atenção aos valores de `products`:** trafegam **sem acento**, porque o padrão do
> Cartman proíbe acento em string — `"Link de recarga facil"`, `"Solucao de Vendas"`.
> O front guarda esse valor em `PRODUCTS[].value` e exibe `PRODUCTS[].label` com acento.
> Mudar um lado sem o outro faz o backend responder `Produto invalido`.

### Resposta `201`

```json
{ "message": "Formulario enviado com sucesso.", "brandName": "PAFER TESTE" }
```

### Erros

| Status | Quando | Corpo |
| --- | --- | --- |
| `400` | Validação de campo | `errors`: array de mensagens em português |
| `404` / `409` / `410` | Mesmos estados do GET | `reason` |
| `413` | Arquivo ou campo acima do limite | `errors` |
| `429` | Mais de 10 envios do mesmo IP em 10 minutos | `errors` + header `Retry-After` |
| `500` | Erro interno | Mensagem genérica |

```json
{
  "message": "Formulario incompleto.",
  "status": 400,
  "errors": [
    "Informe o WhatsApp do responsavel para contato.",
    "Selecione ao menos um produto da Nogle contratado."
  ]
}
```

### O que acontece no servidor

1. Rate limit por IP (10 envios / 10 min).
2. Multer recebe o upload respeitando os limites.
3. `validateSubmission` valida campos e assinatura dos arquivos, e monta
   `req.brandFormPayload`.
4. Confere o estado do link e se a marca já enviou antes.
5. Sobe os arquivos para o S3 em `formulario-marca/<brandId>/<tipo>-<nome>`.
6. Abre transação:
   - `UPDATE FORMULARIO_MARCA SET status='CONCLUIDO' WHERE id=@id AND status='PENDENTE'`
     — zero linhas afetadas significa envio concorrente: rollback e `409`.
   - Insere os anexos em `AG_ANEXOS_GERAL` e guarda os ids.
   - Insere a resposta, com a senha **cifrada**.
   - Insere os produtos.
7. Commit.

---

## 3. GET `/brand-form/brand/:brandId`

Tudo que a marca respondeu. **Exige `auth`** (Bearer JWT).

**Não devolve senha, login nem observações de acesso ao domínio** — só o sinalizador
`tem_acesso_dominio`.

### Resposta `200` — formulário enviado

```json
{
  "status": "CONCLUIDO",
  "onboarding": {
    "id_formulario": "2",
    "status": "CONCLUIDO",
    "gerado_em": "2026-08-11T15:54:53.070Z",
    "enviado_em": "2026-08-11T15:57:48.713Z",
    "nome_empresa": "A VIAGEM PHONE",
    "whatsapp_responsavel": "54656456456",
    "cor_principal": "#1C19B3",
    "cor_secundaria": "#4ABFB8",
    "site": "adsdasdasdasd.com",
    "registrador": "tertertertert",
    "telefone_0800": "08005663453",
    "whatsapp_marca": "23423425245",
    "app_nome": "ffggdfgdfgdfg",
    "app_endereco": "dfgdfgdfgdfgdfg",
    "app_cor_1": "#1E13BE",
    "app_cor_2": "#238EA9",
    "app_desc_curta": "...",
    "app_desc_longa": "...",
    "tem_acesso_dominio": true,
    "logo_url": "https://s3.amazonaws.com/s3-contel-imagens-aplicacao/formulario-marca/75/logo-....png",
    "logo_nome": "Captura de tela 2026-03-24 115043.png",
    "manual_url": null,
    "manual_nome": null,
    "produtos": ["Site Web", "Link de recarga facil", "Notify", "Solucao de Vendas", "Aplicativo Mobile"]
  }
}
```

### Resposta `200` — outros estados

```json
{ "status": "PENDENTE", "onboarding": null, "geradoEm": "2026-08-11T10:29:45.083Z" }
```

```json
{ "status": "SEM_LINK", "onboarding": null }
```

| `status` | Significado |
| --- | --- |
| `CONCLUIDO` | Marca preencheu; `onboarding` vem completo |
| `PENDENTE` | Link gerado, aguardando preenchimento |
| `SEM_LINK` | Nunca foi gerado link para essa marca |

### Erros

`401` sem token ou token inválido · `500` erro interno.

---

## 4. GET `/brand-form/brand/:brandId/domain-access`

Acesso ao painel onde o domínio foi registrado, **com a senha decifrada**.

**Exige `auth` + `requireBrandFormAdmin`.**

### Resposta `200`

```json
{
  "formId": "2",
  "submittedAt": "2026-08-11T15:57:48.713Z",
  "registrar": "Registro.br",
  "website": "pafer.com.br",
  "login": "admin@pafer.com.br",
  "password": "<senha decifrada>",
  "notes": "Autenticacao em duas etapas ativa"
}
```

`password` vem `null` quando já foi purgada ou nunca foi informada.

### Erros

| Status | Quando |
| --- | --- |
| `401` | Sem JWT ou JWT inválido |
| `403` | JWT válido mas o usuário não é admin, ou token sem email |
| `404` | A marca ainda não enviou o formulário |

### Auditoria

Grava em `FORMULARIO_MARCA_ACESSO` **antes** de responder — ação `LEITURA`, email, IP e
data. Se o registro falhar, a leitura falha junto. Tentativa que não encontrou senha
também é registrada. Detalhes em [07-seguranca.md](07-seguranca.md).

---

## 5. DELETE `/brand-form/brand/:brandId/domain-access`

Zera a senha do domínio depois que ele já foi apontado. Idempotente.

**Exige `auth` + `requireBrandFormAdmin`.**

### Resposta `200`

```json
{ "message": "Senha do dominio removida." }
```

`404` quando a marca não tem formulário enviado. Grava ação `PURGA` na auditoria.

---

## Consumindo de fora

A API é consultável por qualquer sistema, não só pelo formulário. Exemplos com a base
de produção (`https://cartman.conteltelecom.com.br`):

```bash
# 1. Estado de um link (público)
curl https://cartman.conteltelecom.com.br/brand-form/SEU_TOKEN

# 2. Enviar o formulário (público)
curl -X POST https://cartman.conteltelecom.com.br/brand-form/SEU_TOKEN   -F 'payload={"companyName":"Minha Marca","contactWhatsapp":"51999999999","products":["Site Web"]}'   -F "logo=@logo.png;type=image/png"

# 3. Dados que a marca respondeu (JWT)
curl -H "Authorization: Bearer $JWT"   https://cartman.conteltelecom.com.br/brand-form/brand/75

# 4. Acesso ao domínio, com a senha (JWT + admin)
curl -H "Authorization: Bearer $JWT"   https://cartman.conteltelecom.com.br/brand-form/brand/75/domain-access

# 5. Apagar a senha depois do domínio apontado (JWT + admin)
curl -X DELETE -H "Authorization: Bearer $JWT"   https://cartman.conteltelecom.com.br/brand-form/brand/75/domain-access
```

O JWT sai de `POST /authenticate` (login do ERP) ou `POST /comercial/login` (login do
CRM) — ver a seção abaixo.

---

## Autenticação

As rotas internas usam o middleware `auth` do Cartman: header
`Authorization: Bearer <jwt>`, assinado com `JWT_SECRET`.

O Cartman tem **dois fluxos de login** que emitem tokens compatíveis:

| Rota | `id` do token |
| --- | --- |
| `POST /authenticate` | `id_PS_PESSOA` (banco `conteltelecom`) |
| `POST /comercial/login` | `id_USUARIOS_MONITOR_NOGLE` (banco `nogle`) |

São tabelas diferentes no mesmo campo, então **o `id` do token é ambíguo**. O
identificador confiável é o **email**, presente nos dois. Por isso `middlewares/auth.js`
expõe `req.userEmail`, e é ele que o gate de admin e a auditoria usam.

`requireBrandFormAdmin` resolve o papel em `USUARIOS_MONITOR_NOGLE` via
`getColaboradorByEmail` e exige `isWhitelisted` **e** `isAdmin` — a mesma fonte que os
fronts usam. O gate é no backend porque checagem de UI não protege endpoint.

---

## Tratamento de erros no front

`src/services/api.jsx` normaliza as respostas:

| Helper | Uso |
| --- | --- |
| `extractReason(error)` | Devolve `NOT_FOUND`, `ALREADY_SUBMITTED`, `EXPIRED`, `UNAUTHORIZED`, `FORBIDDEN`, `TOO_LARGE`, `RATE_LIMITED` ou `UNKNOWN` — decide qual tela de estado mostrar |
| `extractErrors(error)` | Array de mensagens do `400`, exibido no toast de validação |
| `extractRetryAfter(error)` | Segundos do header `Retry-After` no `429`, para avisar quando tentar de novo |

O `500` devolve mensagem genérica; o detalhe fica no log do servidor, para não vazar
nome de tabela ou coluna.
