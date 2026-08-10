# Backend e API

O backend é a API **Cartman** (repositório `cartman`, Node 22 + MVC), apontada por
`REACT_APP_API_URL`. O front fala com ela via axios (`src/services/api.jsx`).

As duas rotas são **públicas de propósito**: não passam pelo middleware `auth`,
porque quem acessa é o cliente da marca. O token opaco da URL é a credencial.

## Endpoints

| Método | Rota | Corpo | Uso |
| --- | --- | --- | --- |
| GET | `/brand-form/:token` | — | Resolve o link e devolve os dados de apresentação. |
| POST | `/brand-form/:token` | `multipart/form-data` | Grava a resposta e fecha o link. |

### GET `/brand-form/:token`

Resposta `200`:

```json
{
  "brandName": "Minha Operadora",
  "products": ["Site Web", "Aplicativo Mobile", "Link de recarga facil", "Solucao de Vendas", "Notify"],
  "expiresAt": null
}
```

`brandName` já vem preenchido no primeiro campo do formulário.

### POST `/brand-form/:token`

Campos do `FormData`:

| Campo | Tipo | Conteúdo |
| --- | --- | --- |
| `payload` | string | JSON com todos os campos de texto. |
| `logo` | arquivo | Opcional. PNG, JPG ou PDF, até 20MB. |
| `brandManual` | arquivo | Opcional. PDF, PNG, JPG ou ZIP, até 20MB. |

Chaves do `payload`: `companyName`, `contactWhatsapp`, `products[]`, `primaryColor`,
`secondaryColor`, `website`, `domainRegistrar`, `domainLogin`, `domainPassword`,
`domainNotes`, `phone0800`, `brandWhatsapp` e — só quando o app foi contratado —
`appName`, `appAddress`, `appColorOne`, `appColorTwo`, `appShortDescription`,
`appLongDescription`.

Os valores de `products` precisam bater **exatamente** com `AVAILABLE_PRODUCTS`
(`cartman/src/modules/brandFormModule.js`), que segue o padrão do projeto e não usa
acento. O front guarda esses valores em `PRODUCTS[].value` e exibe `PRODUCTS[].label`.

Resposta `201`:

```json
{ "message": "Formulario enviado com sucesso.", "brandName": "Minha Operadora" }
```

## Códigos de retorno

| Status | `reason` | Significado | Tela |
| --- | --- | --- | --- |
| `400` | — | Validação de campos; vem `errors` (array de mensagens). | Toast com a lista |
| `404` | `NOT_FOUND` | Token inexistente, inativo ou em status inesperado. | `LinkInvalido` |
| `409` | `ALREADY_SUBMITTED` | A marca já enviou; vem `submittedAt`. | `JaEnviado` |
| `410` | `EXPIRED` | `dtExpiracao_FORMULARIO_MARCA` no passado. | `LinkExpirado` |
| `500` | — | Erro interno. | Toast genérico |

`extractReason` e `extractErrors` (`src/services/api.jsx`) normalizam essas respostas.

## Validação

`src/pages/Formulario/validation.js` espelha
`cartman/src/middlewares/brandFormMiddleware.js`. Regras:

- **Obrigatórios sempre:** nome da empresa, WhatsApp do responsável (10 a 13 dígitos)
  e ao menos um produto.
- **Cores:** formato HEX (`#RGB` ou `#RRGGBB`) quando preenchidas.
- **0800 / WhatsApp da marca:** opcionais, mas com contagem de dígitos validada.
- **Aplicativo Mobile selecionado:** nome, endereço, cor primária, descrição curta e
  descrição longa passam a ser obrigatórios.
- **Regra extra só do front:** a cor primária do app não pode ser igual à cor
  principal da marca (o Jira pede o aviso; aqui vira bloqueio, com mensagem
  explicando a perda de contraste).
- **Domínio:** nenhum campo é obrigatório — a issue não os marca como tal. O peso
  vem do destaque visual e do aviso exibido quando a seção fica vazia.

O backend continua sendo a autoridade: qualquer coisa que passe no front é
revalidada antes de gravar.

## Transação e concorrência

`saveFormSubmission` abre transação e **fecha o link primeiro**, com
`UPDATE ... WHERE status = 'PENDENTE'`. Se `rowsAffected` for zero, outro envio
chegou antes: rollback e `409`. Só depois entram a resposta, os produtos e os
arquivos. Assim dois envios simultâneos nunca geram duas respostas.
