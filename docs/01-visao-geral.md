# Visão geral

## Origem

NOGLE-27602. O onboarding de marcas era feito num formulário do Tally
(`tally.so/r/7RV9V2`), montado às pressas. Problemas que motivaram a refatoração:

- marcas preenchiam **mais de uma vez**, quebrando a sequência da planilha;
- campos obrigatórios sem alerta claro, permitindo envio incompleto;
- informações de domínio — o que trava o projeto de ir ao ar — sem destaque;
- layout não otimizado para celular;
- lista de produtos desatualizada;
- sem identidade visual da Nogle.

## O que este projeto entrega

Formulário público, sem tela de login, acessado por link único gerado dentro do ERP.

| Problema | Solução |
| --- | --- |
| Envio duplicado | Link com token de uso único; após o envio o status vira `CONCLUIDO` e qualquer link da mesma marca passa a recusar novos envios. |
| Validação frouxa | Validação por etapa no front espelhando a do Cartman, com mensagem por campo e resumo no topo. O backend é a autoridade final. |
| Domínio sem prioridade | Etapa própria, card com destaque neon, selo `PRIORIDADE` e aviso quando fica vazia. |
| Mobile | Layout mobile-first, alvos de toque grandes, barra de ação fixa no rodapé e respeito ao safe-area do iOS. |
| Produtos | Site Web, Aplicativo Mobile, Link de recarga fácil, Solução de Vendas e Notify. |
| Identidade | Tema Nogle (verde neon `#02EA75`), Plus Jakarta Sans, dark/light. |

## Fluxo ponta a ponta

1. **ERP** — em *Detalhes da Marca*, o time clica em **GERAR LINK**. O code-behind
   cria (ou reaproveita) um registro em `FORMULARIO_MARCA` com token base64url de
   32 bytes e status `PENDENTE`, e mostra a URL pronta para copiar.
2. **Cliente** — abre `https://formulario.nogle.tech/<token>`. O front chama
   `GET /brand-form/:token`; o Cartman valida o token e devolve o nome da marca
   (que já vem preenchido no primeiro campo).
3. **Preenchimento** — cinco etapas, sendo a última (aplicativo white label)
   condicional à seleção do produto *Aplicativo Mobile*.
4. **Envio** — `POST /brand-form/:token` em `multipart/form-data`: os campos vão no
   JSON `payload`, o logo e o manual de marca vão como arquivos. O Cartman grava a
   resposta em transação e fecha o link.
5. **Depois** — o mesmo link só mostra a tela "Formulário já enviado".

## Onde cada parte mora

| Parte | Repositório | Caminho |
| --- | --- | --- |
| Frontend | `forms-nogle` | este repositório |
| Endpoints | `cartman` | `src/controllers/brandFormController.js`, `src/modules/brandForm*.js`, `src/middlewares/brandFormMiddleware.js` |
| Botão e geração do token | `sistema-contel` | `conteltelecom/web/franquia/marcas/detalhes-marca.aspx(.vb)` |
| Tabelas | banco Contel | `docs/sql/2026-08-10-formulario-marca.sql` |
