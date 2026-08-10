# Rotas e telas

## Rotas

| Rota | Tela | Observação |
| --- | --- | --- |
| `/:token` | `pages/Formulario` | O token do link é a rota inteira. |
| `/` | `pages/Status/LinkInvalido` | Acesso sem token. |
| `*` | `pages/Status/LinkInvalido` | Qualquer outro caminho. |

Não existe rota protegida nem redirecionamento para login — o projeto não tem login.

## Estados da tela do formulário

`pages/Formulario/index.jsx` controla quatro estados:

| Estado | Quando | O que aparece |
| --- | --- | --- |
| `loading` | durante o `GET /brand-form/:token` | spinner |
| `blocked` | resposta 404 / 409 / 410 | `LinkInvalido`, `JaEnviado` ou `LinkExpirado` conforme o `reason` |
| `ready` | token válido e pendente | as etapas do formulário |
| `success` | após `POST` bem-sucedido | `Sucesso` |

## Etapas

Definidas em `pages/Formulario/constants.js` (`STEPS`) e resolvidas por
`STEP_COMPONENTS` no orquestrador.

| Ordem | `id` | Componente | Conteúdo |
| --- | --- | --- | --- |
| 1 | `basico` | `StepBasico` | Texto de apresentação, nome da empresa, WhatsApp do responsável e seleção de produtos. |
| 2 | `identidade` | `StepIdentidade` | Cor principal, cor secundária, logo e manual de marca. |
| 3 | `dominio` | `StepDominio` | Site, registrador, login, senha e observações de acesso. Card destacado. |
| 4 | `contatos` | `StepContatos` | 0800 e WhatsApp da marca. |
| 5 | `app` | `StepApp` | **Condicional**: só entra na lista quando `Aplicativo Mobile` está selecionado. |

Como a lista de etapas é derivada de `form.products`, marcar ou desmarcar o app
na etapa 1 muda o total de etapas e a barra de progresso na hora.

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
| `FileField` | Upload de arquivo único, com nome, tamanho e botão de remover. |
| `ProductPicker` | Cards clicáveis de seleção múltipla dos cinco produtos. |
