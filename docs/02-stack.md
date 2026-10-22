# Linguagens e stack

## Linguagens

- JavaScript (ES2020+) com JSX. Todos os arquivos de código são `.jsx` / `.js`.
- CSS-in-JS (`styled-components` para o global estrutural e Chakra para o resto).

## Ferramenta de build

- Create React App (`react-scripts` 5.0.1). Scripts: `start`, `build`, `test`, `lint`, `eject`.
- Gerenciador de pacotes: npm, com `package-lock.json` versionado. Instalação: `npm ci`.
- Node 20+; o CI usa Node 20. As cópias dos outros produtos ficam fora do projeto.

## Dependências principais

| Pacote | Uso |
| --- | --- |
| `react` / `react-dom` 18 | Base da aplicação |
| `@chakra-ui/react` + `@emotion/*` | UI e estilização |
| Tema local | Identidade Nogle e tokens light/dark em `src/styles/theme.js` |
| `framer-motion` | Peer do Chakra e animações |
| `react-router-dom` 6 | Rota `/:token` |
| `axios` | Cliente HTTP da API Cartman |
| `react-icons` | Ícones — nunca usar emoji na interface |
| `styled-components` | Estilos globais estruturais (`src/styles/global.jsx`) |
| `@fontsource/inter` / `@fontsource/figtree` | Fontes locais usadas nas prévias |

Não há `jwt-decode` nem `jsonwebtoken`: o formulário não tem sessão nem token de
usuário. A única credencial é o token do link, que trafega na URL do endpoint.

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `REACT_APP_API_URL` | URL base da API Cartman. Exemplo em `env-example`: `http://localhost:3333`. |

No CI o valor vem de `secrets.REACT_APP_API_URL` (ver `.github/workflows/deploy.yml`).

## Deploy

GitHub Actions em push para `main`/`master`: `npm ci`, lint, testes, build com
`CI=true`, `aws s3 sync build/` e invalidação do CloudFront. O teste local não
publica nem chama os endpoints de gravação do backend.

`public/.htaccess` traz o rewrite de SPA e os headers de segurança
(HSTS, `X-Frame-Options`, CSP, `Referrer-Policy`, no-cache).
`public/robots.txt` bloqueia indexação — o formulário é acessado por link privado.
