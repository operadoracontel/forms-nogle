# Rotas e telas

## Rotas

| Rota | Tela | Observação |
| --- | --- | --- |
| `/:token` | `pages/Formulario` | O token do link é a rota inteira. |
| `/demo` | `pages/Formulario` | Demonstração explícita; consulta somente o catálogo de marcas, não envia dados e apresenta os quatro mockups visuais. |
| `/` | `pages/Status/LinkInvalido` | Acesso sem token. |
| `*` | `pages/Status/LinkInvalido` | Qualquer outro caminho. |

Não existe rota protegida nem redirecionamento para login — o projeto não tem login.

## Estados da tela do formulário

`pages/Formulario/index.jsx` controla os seguintes estados:

| Estado | Quando | O que aparece |
| --- | --- | --- |
| `loading` | durante o `GET /brand-form/:token` | spinner |
| `blocked` | resposta 404 / 409 / 410 | `LinkInvalido`, `JaEnviado` ou `LinkExpirado` conforme o `reason` |
| `error` | falha de consulta ou contexto inválido/indisponível | aviso de indisponibilidade com retry, sem dados fictícios |
| `ready` | token válido e pendente | as etapas do formulário |
| `success` | após `POST` bem-sucedido | `Sucesso` |

## Etapas

Definidas em `pages/Formulario/constants.js` (`STEPS`) e resolvidas por
`STEP_COMPONENTS` no orquestrador.

| Ordem | `id` | Componente | Conteúdo |
| --- | --- | --- | --- |
| 1 | `basico` | `StepBasico` | Texto de apresentação, busca obrigatória da marca cadastrada no ERP, WhatsApp do responsável e contatos extras (0800 e WhatsApp da marca). Contatos extras opcionais, validados nesta etapa. |
| 2 | `identidade` | `StepIdentidade` | Cor principal, cor secundária, logo, anexo “Identidade visual”, prévias das soluções contratadas e, em seguida, todo o bloco Aplicativo white label (`StepApp`) quando `hasApp: true`. |
| 3 | `dominio` | `StepDominio` | Site, registrador, login, senha e observações de acesso. Card destacado. |

A lista tem sempre três etapas. `hasApp`, recebido no contexto ERP validado,
controla a presença e a validação do bloco Aplicativo dentro de Identidade visual;
seus campos obrigatórios são conferidos antes de avançar para Domínio. Os produtos
não são editáveis. Uma resposta antiga que só contém `products` é insuficiente e
exibe indisponibilidade. Trocar o token limpa campos, arquivos, erros e etapa,
cancela a consulta anterior e ignora respostas atrasadas.

O controle **Possui aplicativo?**, ao lado do título do bloco, começa desmarcado e fechado.
Desativá-lo oculta os campos e todas as prévias do App (inclusive no seletor de
soluções da demonstração), limpa suas pendências e suspende sua validação. O
estado dos campos e arquivos permanece disponível ao reativar. O payload preparado
envia `appEnabled: false` e omite os demais dados e anexos do App; os produtos do
ERP não são alterados. Sem App contratado, o controle e o bloco não são oferecidos.

No bloco Aplicativo, as descrições curta e longa começam vazias. Abrir o bloco ou
trocar a marca não preenche esses campos. **Usar textos padrão** é a única ação
que aplica os modelos, com o nome da marca atual. Os textos continuam editáveis.
Todos os produtos oferecem setas para as telas internas e contador, inclusive no
modal. Quando há mais de um produto disponível, o seletor também tem setas para
alternar entre eles, respeitando as contratações e a opção do App.

O campo **Qual é sua marca?** usa `BrandCombobox` e consulta
`GET /brand-form/catalog/brands`, no formato `{ brands: [{ id, name }] }`. A seleção
guarda `brandId` e `companyName` com o ID e nome canônicos recebidos do ERP; o texto
digitado não se transforma em cadastro. A busca normaliza caixa, acentos, espaços
e pontuação, ordenando correspondências exatas, prefixos, trechos e sugestões com
uma edição de diferença. Prefixos únicos a partir de três caracteres e pequenas
correções a partir de quatro só são completados no blur ou Enter. Se houver
ambiguidade, a pessoa precisa escolher uma opção identificada por nome e ID.

Um nome desconhecido limpa a seleção válida anterior. Falha no catálogo desabilita
o campo e oferece **Tentar novamente**; desmontar o componente cancela a consulta.
Em um link real, a validação exige que a seleção tenha o mesmo `brandId` do contexto
do token. Escolher outro ID não redireciona o link nem troca os produtos ou `hasApp`.

`submissionAvailable: false` permite conferir as etapas, mas desabilita o envio.
Esse é o estado atual da integração local. `/demo` também nunca envia nem mostra
sucesso fictício. Um 404 sem `reason` explícito não é interpretado como link inválido.

## Navegação

- **Continuar** valida só a etapa atual (`validateStep`). Com erro, mostra toast com
  a contagem de pendências, alerta no topo e destaque em cada campo.
- **Enviar formulário** roda `validateAll`. Se sobrar pendência, volta para a
  primeira etapa que ainda tem erro.
- **Voltar** limpa os erros exibidos e não valida.
- Cada troca de etapa rola a página para o topo.
- No mobile a barra de ação fica fixa no rodapé, com `env(safe-area-inset-bottom)`.

## Componentes de formulário

| Componente | Uso |
| --- | --- |
| `SectionCard` | Cabeçalho da seção com ícone, descrição, selo e modo `highlight` (usado no domínio). |
| `TextField` | Input ou textarea com label, helper, erro e `fontSize` 16px no mobile (evita zoom do iOS). |
| `ColorField` | Seletor nativo de cor + campo HEX, sincronizados. |
| `FileField` | Upload de arquivo único, com nome, tamanho e botão de remover. Arquivo de imagem ganha miniatura via `useObjectUrl` (que revoga o blob ao trocar/desmontar). |
| `AppAssetField` | Arquivos separados para logo, ícone e splash do App. Decodifica a imagem local, valida formato/tamanho e exige PNG 512×512 para ícone; erro conserva o arquivo anterior. |
| `AppIdentityPreview` | Compara logo, ícones Android/iOS, splash e texto; calcula contraste e oferece ajuste automático. |
| `BrandCombobox` | Autocomplete obrigatório do catálogo ERP, com nome e ID em cada opção, navegação por teclado, resolução unívoca e estados de carga/erro/retry. |
| `BrandPreview` | Host das prévias completas: `variant="solutions"` seleciona as soluções na etapa Identidade; `variant="app"` apresenta o App no bloco condicional abaixo das soluções, na mesma tela. Inclui navegação entre telas, formato desktop/mobile quando aplicável e ampliação. |

## Prévias por marca

Os componentes em `src/components/Preview/` apresentam modelos React com conteúdo
demonstrativo. O App reproduz as cinco screenshots do aplicativo Netcel disponíveis
nas referências do app Netcel: Entrar, Início, Menu, Recarga e Linhas. Perfil e
Portabilidade são telas complementares do Figma White Label — Vox, sem screenshot
Netcel fornecida. As cópias de Venda Direta, Webpresence, Recarga-Fácil e Netcel
estão arquivadas fora do Forms; veja [Prévias e referências](09-previas-e-referencias.md).
As imagens locais
de Vendas e Webpresence estão em `public/preview-assets/`, incluindo o PNG de Vendas
extraído sem modificação do SVG `src/assets/images/backImage.svg` da referência.
Não há integração ao vivo com Figma, Flutter, dados de assinantes ou APIs dos produtos.

Na etapa **Identidade**, `BrandPreview` recebe `contractedProducts`, `hasApp` e
`isDemo`. Em um link real, o seletor respeita os nomes canônicos dos produtos do
contexto ERP; a disponibilidade do App depende de `hasApp`. Sem produto visual
compatível, o bloco de prévias fica oculto. Em `/demo`, o seletor mostra App,
Solução de Vendas, Site Webpresence e Recarga-Fácil, sem modificar os produtos do
contexto ou do payload. Os rótulos novos preservam os valores ERP `Site Web` e
`Link de recarga facil`; uma marca recebe somente as prévias contratadas.

As opções de apresentação são:

- **App:** Entrar (inicial), Apresentação, Splash, Início, Recarga, Linhas, Menu, Perfil e Portabilidade
  na moldura de celular. Início e Recarga são telas distintas; os botões internos
  de navegação acompanham o seletor do host.
  As setas anterior/próxima percorrem a lista em ciclo e funcionam também na
  ampliação. Apresentação usa o celular centralizado, sem nome ou logo ao lado.
- **Solução de Vendas:** Planos, Configurar plano, Pagamento e Próximos passos.
  O checkout percorre plano/chip, informações, endereço, método e apresentação do
  pagamento. Franquia, portabilidade, período e chip atualizam o resumo localmente.
- **Site Webpresence:** Página inicial, Planos, Vantagens, Nosso app e Perguntas
  frequentes. Os controles posicionam a seção dentro da prévia; menu mobile e FAQ
  são interativos e os CTAs apresentam avisos locais.
- **Recarga-Fácil:** Linha, Segurança, Planos, Pagamento e Concluída. A confirmação
  de linha e SMS é ilustrativa; PIX, cartão e boleto não geram cobrança nem recebem
  dados reais. A escolha do plano atualiza o resumo e a confirmação demonstrativa.
- Os três produtos web têm formato desktop/mobile e ampliação.

O botão **Ampliar prévia** abre uma visualização maior para conferir o layout. As
ações dentro dos mockups são demonstrativas e não enviam o formulário, contratam
produtos ou alteram a validação das etapas. A ampliação e a escolha de uma tela
também não interferem na navegação do formulário.

Logo e nome acompanham os campos preenchidos. A etapa Identidade usa
`form.primaryColor`; o bloco Aplicativo usa `form.appColorOne` e o nome do aplicativo
quando preenchido. A regra do bloco Aplicativo continua sendo o `hasApp` validado
no ERP. Cor vazia ou inválida usa o cinza neutro `#4A4A50` somente na apresentação.
Os produtos web usam branco como secundária visual. Na etapa Aplicativo,
`appColorTwo` é a cor de contraste (padrão branco), usada nos textos e ícones sobre
a primária. Um contraste baixo gera orientação visual, sem bloquear a escolha.
O fundo do ícone acompanha a primária quando vazio. Splash personalizada permite
cor e imagem próprias; desligada, usa primária e logo do App. Logo e ícone são
arquivos independentes; o logo da marca é o padrão se não houver logo específico.

Logos PNG/JPG selecionados aparecem por URL local temporária, sem upload para
montar a prévia. O PDF continua aceito como anexo e usa o nome da marca no mockup,
com uma explicação curta. O Forms oferece essas visualizações; a exportação PNG
está disponível no Suporte Nogle.
