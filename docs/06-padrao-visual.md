# Padrão visual

Definido em `src/styles/`. Manter este padrão em qualquer tela nova.

## Tema

- A base é o `nogletheme` do `@nogle/ui`. Sobre ele, `src/styles/theme.js` aplica os
  **semantic tokens** de light/dark — o tema da lib ainda é dark-only, então esses
  overrides são o que garante contraste nos dois modos. Quando o `@nogle/ui` passar a
  expor semantic tokens, este arquivo encolhe.
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

- Fonte única: `Plus Jakarta Sans`.
- Corpo em 15px. Inputs usam 16px no mobile — abaixo disso o Safari do iOS dá zoom
  automático ao focar o campo.

## Componentes

- Botão sólido: fundo `secondary`, texto `primary`, borda `lg`.
- Input/Textarea/Select: fundo `surface`, borda `borderPrimary`, foco e inválido
  com borda colorida e sem `boxShadow`.
- Card de seção (`SectionCard`): borda `borderPrimary`; com `highlight`, borda
  `secondary` e halo neon suave — reservado para a seção de domínio.
- Checkbox e cards de produto marcados usam `secondary` com `secondarySubtle` de fundo.
- Ícones sempre via `react-icons`. Nunca emoji.

## Layout e mobile

- `PageShell`: header fixo com a marca e o toggle de tema, conteúdo em
  `container.md` e rodapé.
- Espaçamentos e colunas responsivos: `SimpleGrid` de 1 coluna no mobile e 2 a partir
  de `md`.
- Barra de ação (Voltar / Continuar / Enviar) fixa no rodapé no mobile e estática no
  desktop, com `padding-bottom: env(safe-area-inset-bottom)`.
- `#root` usa `min-height: 100dvh` para não quebrar com a barra do navegador móvel.
- Alvos de toque grandes: cards de produto e área de upload ocupam a largura toda.
