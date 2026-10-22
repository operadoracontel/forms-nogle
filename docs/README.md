# Documentação — Forms Nogle

Atualizado em 22/10/2026: produtos automáticos do ERP, App condicional a `hasApp`,
anexo “Identidade visual” e envio local indisponível. Contrato e limites em
[Backend e API](04-backend-e-api.md); fluxo de tela em [Rotas e telas](03-rotas-e-telas.md).

O nome da marca agora é uma seleção obrigatória do catálogo ERP, com nome e ID
canônicos, tolerância a uma edição e conclusão automática somente quando unívoca.
A seleção não muda o destino de um link real. O POST continua indisponível neste
ambiente, sem sucesso simulado.

As prévias completas de App, Solução de Vendas, Site Webpresence e Recarga-Fácil acompanham logo e cor do
formulário. A seleção real respeita os produtos do ERP e `hasApp`; `/demo` apresenta
as prévias disponíveis sem alterar o contexto de contratação; o App depende de
**Possui aplicativo?**, que começa desmarcado. Telas, ampliação e regras de
cor estão em [Rotas e telas](03-rotas-e-telas.md#prévias-por-marca) e
[Padrão visual](06-padrao-visual.md#prévias-dos-produtos).

O App usa cinco telas de screenshots Netcel (Entrar, Início, Menu, Recarga e
Linhas), mais Perfil e Portabilidade do Figma White Label — Vox. A apresentação
reutiliza o Início e todas as telas usam dados demonstrativos. Os três produtos web
se baseiam nas cópias locais fornecidas, com navegação local e imagens da referência.
`Site Web` e `Link de recarga facil` continuam sendo os valores canônicos do ERP,
apresentados como **Site Webpresence** e **Recarga-Fácil** na interface.

| Documento | Conteúdo |
| --- | --- |
| [01-visao-geral.md](01-visao-geral.md) | O que é, de onde veio (NOGLE-27602) e o fluxo ponta a ponta. |
| [02-stack.md](02-stack.md) | Linguagens, build, dependências e variáveis de ambiente. |
| [03-rotas-e-telas.md](03-rotas-e-telas.md) | Rotas, etapas, estados e prévias completas dos produtos. |
| [04-backend-e-api.md](04-backend-e-api.md) | **Referência completa dos endpoints** — contratos, payloads, códigos de retorno e autenticação. |
| [05-banco-de-dados.md](05-banco-de-dados.md) | Tabelas, colunas e ciclo de vida do link. |
| [06-padrao-visual.md](06-padrao-visual.md) | Tema, tokens, componentes, identidade dos mockups e regras de mobile. |
| [07-seguranca.md](07-seguranca.md) | Token do link, trava de duplicidade e dados sensíveis. |
| [08-erp-integracao.md](08-erp-integracao.md) | Botão na tela Detalhes da Marca (sistema-contel). |
| [09-previas-e-referencias.md](09-previas-e-referencias.md) | Código das prévias, imagens usadas e localização das referências arquivadas fora do Forms. |
| [07-revisao-producao.md](07-revisao-producao.md) | Revisão do frontend e pendências de integração, sem publicação ou alteração do backend. |
| [sql/PRODUCAO.md](sql/PRODUCAO.md) | **Runbook para subir em produção** — quais scripts rodar, verificação e rollback. |
| [sql/](sql) | DDL das tabelas e migrações, com bloco de rollback em cada arquivo. |
