# Linguagens e stack

## Linguagens

- JavaScript (ES2020+) com JSX. Todos os arquivos de código são `.jsx` / `.js`.
- CSS-in-JS (`styled-components` para o global estrutural e Chakra para o resto).

## Ferramenta de build

- Create React App (`react-scripts` 5.0.1). Scripts: `start`, `build`, `eject`.
- Gerenciador de pacotes: Yarn (Berry — ver `.yarnrc.yml`, `nodeLinker: node-modules`).
- Mesmo padrão de `monitor-nogle` e `schedule-nogle`.

## Dependências principais

| Pacote | Uso |
| --- | --- |
| `react` / `react-dom` 18 | Base da aplicação |
| `@chakra-ui/react` + `@emotion/*` | UI e estilização |
| `@nogle/ui` | Design system oficial (tema `nogletheme` como base) |
| `framer-motion` | Peer do Chakra e animações |
| `react-router-dom` 6 | Rota `/:token` |
| `axios` | Cliente HTTP da API Cartman |
| `react-icons` | Ícones — nunca usar emoji na interface |
| `styled-components` | Estilos globais estruturais (`src/styles/global.jsx`) |
| `react-device-detect` | Detecção de dispositivo quando necessário |

Não há `jwt-decode` nem `jsonwebtoken`: o formulário não tem sessão nem token de
usuário. A única credencial é o token do link, que trafega na URL do endpoint.

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `REACT_APP_API_URL` | URL base da API Cartman. Exemplo em `env-example`: `http://localhost:3333`. |

No CI o valor vem de `secrets.REACT_APP_API_URL` (ver `.github/workflows/deploy.yml`).

## Deploy

GitHub Actions em push para `main`/`master`: `yarn install --frozen-lockfile`,
`yarn build`, `aws s3 sync build/` e invalidação do CloudFront. Idêntico ao
`monitor-nogle`.

`public/.htaccess` traz o rewrite de SPA e os headers de segurança
(HSTS, `X-Frame-Options`, CSP, `Referrer-Policy`, no-cache).
`public/robots.txt` bloqueia indexação — o formulário é acessado por link privado.
