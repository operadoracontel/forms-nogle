<p align="center">
  <img src="./src/assets/Nogle_Simbolo_Verde_Neon.svg" width="80" alt="Nogle Logo" />
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

- **Stack:** React 18, Chakra UI v2, tema Nogle local e Axios
- **Backend:** API Cartman (`/brand-form/:token`)
- **Infra:** S3 + CloudFront (CI/CD GitHub Actions)
- **Design:** tema Nogle com suporte a dark/light

Atualização local de **22/10/2026**: os produtos vêm automaticamente do ERP; a
pergunta de seleção foi removida. O bloco Aplicativo aparece somente quando o
contexto da marca informa `hasApp: true`. O anexo de manual agora se chama
**Identidade visual**.

O campo obrigatório **Qual é sua marca?** pesquisa o catálogo do ERP e armazena o
nome canônico junto ao ID da marca escolhida. A busca ignora caixa e acentos e
tolera um pequeno erro de digitação; ao sair do campo ou pressionar Enter, só
completa uma correspondência unívoca. Nomes desconhecidos não criam marcas e
ambiguidades exigem escolher uma opção. Em links reais, a seleção precisa ter o
mesmo ID do contexto: o campo não muda a marca nem os produtos vinculados ao token.

As etapas de identidade agora apresentam os mockups completos do **Aplicativo**,
da **Solução de Vendas**, do **Site Webpresence** e do **Recarga-Fácil**, com logo, nome e cor atualizados
enquanto o formulário é preenchido. A etapa Identidade mostra as soluções visuais
contratadas no ERP; logo depois das prévias, o bloco Aplicativo white label mantém
a condição `hasApp: true`, dentro da mesma tela Identidade visual. Em `/demo`,
o seletor permite explorar os modelos sem alterar os produtos do contexto ou do
envio; o App fica disponível ao ativar **Possui aplicativo?**.

O App usa as cinco telas presentes nas screenshots locais do aplicativo Netcel
(Entrar, Início, Menu, Recarga e Linhas); Perfil e Portabilidade mantêm o modelo
complementar do Figma White Label — Vox. Dados de conta, linhas e valores são
demonstrativos, e o logo, nome e cor vêm da marca selecionada.

Vendas, Webpresence e Recarga-Fácil usam os produtos locais fornecidos como
referência de layout e navegação. Essas cópias estão arquivadas fora do projeto,
em `C:\Sites\forms-nogle-referencias\2026-10-22`, e não são dependências do Forms.
Vendas inclui franquia, portabilidade, chip e etapas do pedido; Webpresence inclui
hero, planos, benefícios, aplicativo e FAQ; Recarga-Fácil inclui linha, segurança,
planos e formas de pagamento. As imagens de apresentação vêm das próprias cópias,
em `public/preview-assets/`. Nenhum provider ou cliente HTTP dos produtos é executado.

Os produtos web usam branco como secundária visual. Na etapa Aplicativo, a cor de
contraste controla textos e ícones sobre a primária, com medidor e ajuste automático.
O bloco de identidade mostra logo, ícones Android/iOS, splash e texto em tempo real.
Há logo próprio opcional (PNG/SVG/JPG), ícone PNG 512×512, fundo do ícone e splash
personalizada com cor ou imagem. Sem logo próprio, usa o logo da marca. A tela
Splash também está disponível na prévia ampliada. Todos os arquivos são locais
durante o preenchimento; o envio permanece desativado neste ambiente.
Há seleção de telas, visualização desktop/mobile para os três produtos web e o botão
**Ampliar prévia**. O Forms oferece visualização; a exportação PNG continua no
Suporte Nogle.

Ao lado de **Aplicativo white label**, **Possui aplicativo?** começa desmarcado.
Ao desativar a opção, campos e prévias somem, a validação do App é suspensa e seus arquivos e
detalhes são omitidos do payload preparado. Reabrir conserva o preenchimento;
a contratação ERP permanece intacta. As descrições começam vazias e só recebem os
modelos ao clicar em **Usar textos padrão**. Todos os produtos e telas têm setas
para navegar. O App começa em **Entrar**, com o celular centralizado, sem marca lateral.

As consultas GET foram preparadas para contexto e catálogo, sem criar tabelas ou links. Neste ambiente,
`submissionAvailable: false` mantém o envio desabilitado e mostra um aviso. O POST,
uploads e persistência descritos no contrato histórico ainda não foram restaurados.
Não há simulação de envio bem-sucedido. A demonstração visual fica somente em `/demo`.

---

## Fluxo

```
ERP (detalhes-marca.aspx)          Formulário (este repo)          Cartman
  botão GERAR LINK
  → INSERT FORMULARIO_MARCA
    (token base64url, PENDENTE)
  → mostra a URL                     cliente abre /:token
                                     → GET /brand-form/:token  →  valida token
                                     ← nome / produtos ERP / hasApp / disponibilidade
                                     preenche em 3 etapas
                                     → POST /brand-form/:token →  grava + fecha o link
                                                                   (status CONCLUIDO)
```

Estados finais que o cliente pode ver: **link inválido**, **link expirado**,
**formulário já enviado** e **sucesso**.
Falhas de consulta exibem **formulário indisponível**, com botão para tentar novamente.

---

## API

Este repositório é a **referência oficial da API do formulário**. Os endpoints executam
no Cartman (`cartman.conteltelecom.com.br`); o contrato completo de cada um — payload,
respostas, códigos de erro e autenticação — está em
[`docs/04-backend-e-api.md`](./docs/04-backend-e-api.md).

Na preparação local, somente as consultas GET públicas foram implementadas. As demais rotas
abaixo são referências do contrato histórico, ainda indisponíveis neste checkout.

| Método | Rota | Acesso |
| --- | --- | --- |
| GET | `/brand-form/:token` | Público |
| GET | `/brand-form/catalog/brands` | Público, catálogo de nomes e IDs do ERP |
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
│   ├── Form/         # SectionCard, TextField, ColorField, FileField, BrandCombobox
│   ├── Layout/       # PageShell (header + conteúdo + footer)
│   ├── Preview/      # host BrandPreview + App, Vendas, Webpresence e Recarga-Fácil
│   └── Status/       # StatusScreen (telas de estado final)
├── pages/
│   ├── Formulario/   # orquestrador, etapas, constantes e validação
│   └── Status/       # LinkInvalido, LinkExpirado, JaEnviado, Sucesso
├── routes/           # /:token e /demo
├── services/         # axios + chamadas da API
├── styles/           # tema Nogle local, tokens semânticos e estilos globais
└── utils/            # máscaras, formatação e busca canônica de marcas
```

---

## Instalação e Execução

### Pré-requisitos

- Node.js 20+ e npm

### Passo a Passo

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/operadoracontel/forms-nogle.git
   ```

2. **Instale as dependências:**

   ```bash
   npm ci
   ```

3. **Configure as variáveis de ambiente** (arquivo `.env` na raiz, baseado no `env-example`):

   ```env
   REACT_APP_API_URL=http://localhost:3333
   ```

4. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm start
   ```

   Acesse em `http://localhost:3000/<token>` — sem token a aplicação mostra "link inválido".

### Verificações

```bash
npm run lint
npm test -- --watchAll=false --runInBand
npm run build
```

O `package-lock.json` é versionado e usado pelo CI com `npm ci`. Os fontes das
quatro referências não entram no build: somente `src/` e os assets em `public/`
são necessários. A origem das imagens e a localização das cópias estão em
[Prévias e referências](docs/09-previas-e-referencias.md).

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
