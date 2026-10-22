# Padrão visual

Definido em `src/styles/`. Manter este padrão em qualquer tela nova.

## Tema

- O tema é implementado localmente em `src/styles/theme.js`, sobre o Chakra.
  Os tokens semânticos de light/dark definem as cores de cada modo; não há
  dependência de tema privado ou de um objeto de tema vazio.
- Modo inicial `dark`, sem seguir o tema do sistema. O botão no header alterna.
- Componentes devem usar tokens (`background`, `surface`, `surfaceRaised`,
  `textPrimary`, `textSecondary`, `textMuted`, `borderPrimary`, `secondary`,
  `secondarySubtle`, `danger`) em vez de cores fixas.

## Cores oficiais

| Token | Light | Dark | Uso |
| --- | --- | --- | --- |
| `secondary` | `#02EA75` | `#02EA75` | Verde neon Nogle: ações, foco, destaques |
| `primary` | `#021E00` | `#021E00` | Texto sobre o neon |
| `background` | `#F2EDDA` | `#0C0C0C` | Fundo da aplicação |
| `surface` | `#FFFFFF` | `#1A1A1A` | Cards, header, modais |
| `surfaceRaised` | `#F6F3E7` | `#202024` | Chips, blocos auxiliares |
| `textPrimary` | `#021E00` | `#FFFFFF` | Texto principal |
| `textSecondary` | `#4A5A4A` | `#A0A3A8` | Texto de apoio |
| `borderPrimary` | `#B3AB93` | `#27272B` | Bordas e divisórias |
| `danger` | `#E53E3E` | `#FC8181` | Erros de validação |

`colors.js` mantém a paleta raw da marca; o comportamento light/dark fica nos
semantic tokens de `theme.js`.

## Tipografia

- O formulário, seus controles e o mockup do App usam `Plus Jakarta Sans`.
  Vendas e Site preservam as famílias `Inter` e `Figtree` dos layouts de
  referência, servidas localmente.
- Corpo em 15px. Inputs usam 16px no mobile — abaixo disso o Safari do iOS dá zoom
  automático ao focar o campo.

## Componentes

- Botão sólido: fundo `secondary`, texto `primary`, borda `lg`.
- Input/Textarea/Select: fundo `surface`, borda `borderPrimary`, foco e inválido
  com borda colorida e sem `boxShadow`.
- Card de seção (`SectionCard`): borda `borderPrimary`; com `highlight`, borda
  `secondary` e halo neon suave — reservado para a seção de domínio.
- Controles de seleção e abas de prévia usam os destaques do tema Nogle.
- A busca obrigatória de marca (`BrandCombobox`) usa os tokens de input e lista de
  opções do tema, com nome e ID canônicos em cada linha. Exibe até 50 opções por
  vez, pede mais texto quando necessário e aceita setas, Enter e Escape. Um nome
  ambíguo ou desconhecido não se torna seleção válida; o link mantém sua marca de
  origem mesmo quando outro nome é pesquisado.
- Ícones sempre via `react-icons`. Nunca emoji.

## Layout e mobile

- `PageShell`: header fixo com a marca e o toggle de tema, conteúdo em
  `container.md` e rodapé.
- Espaçamentos e colunas responsivos: `SimpleGrid` de 1 coluna no mobile e 2 a partir
  de `md`.
- Barra de ação (Voltar / Continuar / Enviar) fixa no rodapé no mobile e estática no
  desktop, com `padding-bottom: env(safe-area-inset-bottom)`.
- `#root` usa `min-height: 100dvh` para não quebrar com a barra do navegador móvel.
- Alvos de toque grandes: seletores de prévia e áreas de upload se adaptam à largura disponível.

## Prévias dos produtos

`BrandPreview` organiza os mockups completos `AppPreview`, `VendaPreview` e
`SitePreview` e `RecargaPreview`, com as molduras `PhoneFrame` e `BrowserFrame`. Os seletores e o
entorno acompanham os tokens light/dark do Forms; o conteúdo do mockup conserva
a identidade visual do produto.

O App usa como referência as screenshots locais Netcel de Entrar, Início, Menu,
Recarga e Linhas. Perfil e Portabilidade preservam as telas complementares do
Figma White Label — Vox; a apresentação reutiliza o Início. A configuração Flutter
local aplica a mesma paleta clara nos dois modos. Por isso, o tema escuro do Forms
altera o entorno e os controles, enquanto as superfícies brancas do aplicativo
permanecem brancas. A fonte Flutter não está declarada no wrapper local; o mockup
React usa `Inter`.

O App abre em Entrar e oferece setas anterior/próxima nas laterais do celular,
centralizadas na altura dele, também no modal. Os três produtos web também têm
setas laterais; o seletor de produtos tem anterior/próximo. O contador de telas
continua no cabeçalho de todos os produtos.
Todas as telas, incluindo Apresentação, usam o celular centralizado e
fundo neutro; não há bloco de nome/logo lateral. O controle Possui aplicativo?
fica ao lado do título Aplicativo white label e desativa o bloco e suas prévias.

- **Cor principal:** atualiza ao vivo a partir do campo da etapa. Na Identidade,
  usa a cor principal da marca; no Aplicativo, a cor primária do app. O fallback
  de apresentação é `#4A4A50` para valor vazio ou inválido.
- **Secundária visual:** os produtos web mantêm branco; na etapa Aplicativo,
  `appColorTwo` controla texto e ícones sobre a primária e começa em branco.
- **Contraste:** `AppIdentityPreview` calcula a razão de luminância entre primária
  e contraste (4,5:1 como referência para texto). Oferece ajuste automático para
  branco ou `#111827`. É uma orientação, sem inferir a cor de um logo pela cor da marca.
  Títulos e ícones sobre superfícies brancas continuam com contraste calculado.
- **Logo:** PNG/JPG aparece por blob URL local e acompanha a substituição ou remoção
  do arquivo. Para PDF, o mockup mostra o nome da marca e explica a limitação visual.
  Na etapa App, o logo próprio aceita PNG/SVG/JPG e mantém suas cores originais.
- **Assets do App:** logo, ícone PNG 512×512 e imagem opcional da splash são
  independentes, até 20MB cada. Os cards mostram miniatura e substituir/remover.
  As URLs são revogadas ao trocar/desmontar; leituras pendentes são canceladas.
  Fundo do ícone e splash seguem a primária por padrão; splash personalizada
  permite cor ou imagem. A tela Splash aparece também na prévia completa.
- **Conteúdo:** textos, planos e valores demonstrativos. Vendas e Webpresence usam
  imagens da própria cópia local; Recarga-Fácil reproduz cabeçalho, cartão de linha,
  planos e pagamento da referência. Nenhuma prévia recebe dados de cartão, OTP ou
  pagamento reais. Os clientes HTTP dos produtos não são importados.

O host oferece seleção de produto e telas internas. Vendas, Webpresence e Recarga-Fácil têm alternância
desktop/mobile; o App mantém sua moldura de celular. A área respeita a largura do
formulário e permite leitura do conteúdo completo. **Ampliar prévia** abre o mesmo
layout em uma área maior, sem interromper o preenchimento.

Em links reais, a seleção acompanha `contractedProducts` e `hasApp` do ERP. Na rota
`/demo`, as prévias ficam disponíveis conforme a opção do App e não mudam o contexto
de contratação nem o payload. A visualização não grava cor, logo ou outras escolhas
por conta própria. A exportação PNG permanece no Suporte Nogle.
