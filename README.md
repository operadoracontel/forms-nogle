<p align="center">
  <img src="./Nogle_Simbolo_Verde_Neon.svg" width="80" alt="Nogle Logo" />
</p>

<h1 align="center">Forms Nogle</h1>

<p align="center">
  Formulário de onboarding de marca da <strong>Nogle</strong>.<br/>
  Coleta as informações de produção dos produtos contratados — sem tela de login.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/chakra--ui-v2-319795?style=flat-square&logo=chakra-ui" />
  <img src="https://img.shields.io/badge/build-cra-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/aws-deploy-232F3E?style=flat-square&logo=amazon-aws" />
</p>

---

## Sobre o Projeto

Substitui o formulário de onboarding feito no Tally (NOGLE-27602). O acesso é por
**link único e opaco**, gerado dentro do ERP na tela *Detalhes da Marca*. Não existe
login: o token do link é a única credencial, e cada marca só consegue enviar **uma vez**.

- **Stack:** React 18, Chakra UI v2, `@nogle/ui`, Axios
- **Backend:** API Cartman (`/brand-form/:token`)
- **Infra:** S3 + CloudFront (CI/CD GitHub Actions)
- **Design:** tema Nogle com suporte a dark/light

---

## Fluxo

```
ERP (detalhes-marca.aspx)          Formulário (este repo)          Cartman
  botão GERAR LINK
  → INSERT FORMULARIO_MARCA
    (token base64url, PENDENTE)
  → mostra a URL                     cliente abre /:token
                                     → GET /brand-form/:token  →  valida token
                                     ← nome da marca / estado
                                     preenche em 5 etapas
                                     → POST /brand-form/:token →  grava + fecha o link
                                                                   (status CONCLUIDO)
```

Estados finais que o cliente pode ver: **link inválido**, **link expirado**,
**formulário já enviado** e **sucesso**.

---

## API

Este repositório é a **referência oficial da API do formulário**. Os endpoints executam
no Cartman (`cartman.conteltelecom.com.br`); o contrato completo de cada um — payload,
respostas, códigos de erro e autenticação — está em
[`docs/04-backend-e-api.md`](./docs/04-backend-e-api.md).

| Método | Rota | Acesso |
| --- | --- | --- |
| GET | `/brand-form/:token` | Público |
| POST | `/brand-form/:token` | Público |
| GET | `/brand-form/brand/:brandId` | JWT |
| GET | `/brand-form/brand/:brandId/domain-access` | JWT + admin |
| DELETE | `/brand-form/brand/:brandId/domain-access` | JWT + admin |

Consultar os dados de uma marca:

```bash
curl -H "Authorization: Bearer $JWT"   https://cartman.conteltelecom.com.br/brand-form/brand/75
```

Do lado do front, as chamadas ficam todas em `src/services/api.jsx` — nenhuma tela monta
URL própria.

---

## Estrutura

```
src/
├── components/
│   ├── Form/         # SectionCard, TextField, ColorField, FileField, ProductPicker
│   ├── Layout/       # PageShell (header + conteúdo + footer)
│   └── Status/       # StatusScreen (telas de estado final)
├── pages/
│   ├── Formulario/   # orquestrador, etapas, constantes e validação
│   └── Status/       # LinkInvalido, LinkExpirado, JaEnviado, Sucesso
├── routes/           # /:token
├── services/         # axios + chamadas da API
├── styles/           # tema Nogle (semantic tokens sobre o nogletheme)
└── utils/            # máscaras e formatação
```

---

## Instalação e Execução

### Pré-requisitos

- Node.js 18+
- NPM ou Yarn

### Passo a Passo

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/operadoracontel/forms-nogle.git
   ```

2. **Instale as dependências:**

   ```bash
   yarn install
   ```

3. **Configure as variáveis de ambiente** (arquivo `.env` na raiz, baseado no `env-example`):

   ```env
   REACT_APP_API_URL=http://localhost:3333
   ```

4. **Inicie o servidor de desenvolvimento:**

   ```bash
   yarn start
   ```

   Acesse em `http://localhost:3000/<token>` — sem token a aplicação mostra "link inválido".

---

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `REACT_APP_API_URL` | URL base da API Cartman |
| `AWS_ACCESS_KEY_ID` | (CI/CD) Credencial AWS para deploy |
| `AWS_SECRET_ACCESS_KEY` | (CI/CD) Secret AWS para deploy |
| `AWS_REGION` | Região do bucket S3 |
| `S3_BUCKET_NAME` | Bucket de hospedagem |
| `CLOUDFRONT_DISTRIBUTION_ID` | Distribuição para invalidação de cache |

---

## Documentação

A pasta [`docs/`](./docs) detalha stack, rotas, contrato da API, banco de dados,
padrão visual e as decisões de segurança. O DDL das tabelas está em
[`docs/sql/`](./docs/sql).

---

<p align="center">
  Feito com 💚 pela equipe <strong>Nogle</strong>
</p>
