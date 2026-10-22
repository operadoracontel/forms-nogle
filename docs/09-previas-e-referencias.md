# Prévias e referências

As quatro cópias fornecidas serviram de referência visual. Não são dependências
do Forms e não devem ficar dentro deste repositório. Em 22/10/2026 foram
arquivadas em `C:\Sites\forms-nogle-referencias\2026-10-22`, preservando os fontes
e os históricos Git.

| Referência arquivada | Implementação no Forms |
| --- | --- |
| `link-venda-direta - Copia` | `src/components/Preview/VendaPreview.jsx` e seu CSS |
| `netcel_app - Copia` | `AppPreview.jsx`, `PhoneFrame.jsx` e `AppIdentityPreview.jsx` |
| `recarga-facil - Copia` | `RecargaPreview.jsx` e seu CSS |
| `webpresence - Copia` | `SitePreview.jsx` e seu CSS |

## Organização do código

- `BrandPreview.jsx`: seleção de produtos, telas, setas, escala e ampliação.
- `AppIdentityPreview.jsx`: contraste, logo, ícones e splash do aplicativo.
- `CommercePreviewUI.jsx`: componentes compartilhados dos três produtos web.
- `BrowserFrame.jsx`, `PhoneFrame.jsx` e `BrandLogo.jsx`: molduras e identidade.
- `previewUtils.js`: normalização de cor e contraste compartilhados.
- `src/components/Form/`: campos de preenchimento e upload; sem código das referências.
- Os testes ficam junto aos módulos que verificam, com sufixo `.test.js` ou `.test.jsx`.

## Imagens mantidas

| Asset em `public/preview-assets/` | Origem |
| --- | --- |
| `vendas-person.png` | PNG incorporado em `src/assets/images/backImage.svg` de Venda Direta, extraído sem edição |
| `webpresence-hero.png` | Imagem de apresentação dos assets locais de Webpresence |
| `webpresence-person.png` | Imagem de apoio dos assets locais de Webpresence |

Esses três arquivos já estão no Forms. Build, testes e execução não leem as
pastas arquivadas. O app Netcel forneceu referências de telas; o mockup React não
executa Flutter nem importa seus providers ou assets de marca.

## Instalação e verificação

Use npm e o `package-lock.json` versionado. `npm ci` instala; `npm run lint`,
`npm test -- --watchAll=false --runInBand` e `npm run build` verificam o frontend.
`node_modules/`, `build/`, `.env` e logs ficam fora do Git. A limpeza não altera
contratos, banco de dados, API ou publicação.

Após a limpeza: 88 testes aprovados, lint sem avisos, build concluído e simulação
de `npm ci` aceita. A auditoria de imports encontrou 51 módulos/arquivos de runtime
alcançáveis, nenhum import local quebrado e nenhum módulo JavaScript órfão.
