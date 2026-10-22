# Revisão para produção — 22/10/2026

## Interface revisada

- Três etapas: Informações básicas, Identidade visual e Domínio e acesso.
- Possui aplicativo? começa desmarcado. Campos e prévias só são habilitados após a seleção explícita, para marcas com App no contexto ERP.
- Descrições curta e longa vazias até clicar em Usar textos padrão. O botão personaliza ambos os modelos com a marca atual.
- Setas para os produtos disponíveis e para todas as suas telas, na prévia normal e no modal; a seleção respeita ERP e App habilitado.
- Removido o banner “Demonstração. As informações não serão enviadas.” e revisados os textos de teste do App, Vendas, Webpresence e Recarga-Fácil. Os modelos continuam identificados como prévias.
- Preservados os estados reais de erro: link inválido, expirado, já enviado, falha de consulta e envio indisponível.
- Removida a promessa de armazenamento criptografado do helper da senha enquanto não existe persistência implementada neste backend.

## Impedimento para receber respostas reais

O código atual de `C:/Sites/cartman/src/router.js` registra somente GET de catálogo e contexto para `/brand-form`. `src/controllers/brandFormContextController.js` responde `submissionAvailable: false` e não existe POST público para gravar as respostas. A integração local permanece somente de leitura.

O frontend respeita essa informação: mantém o botão de envio indisponível. A rota `/demo` também continua sem envio ou sucesso fictício, embora o banner de demonstração tenha sido retirado.

Antes de publicar para coleta real é necessário implementar ou apontar para uma API que ofereça persistência, validação no servidor, anexos, tratamento dos acessos do domínio e fechamento do link após envio. Os novos campos do App e a regra `appEnabled` precisam integrar esse contrato. Não foram executadas migrações, modificações de banco ou publicação nesta revisão.

## Publicação

Há workflow de build e publicação S3/CloudFront em `.github/workflows/`, com `REACT_APP_API_URL` fornecida pelo ambiente Deploy do GitHub. A existência e os valores dos segredos de produção não foram verificados. O build local não confirma o funcionamento da API de produção.

Os testes do frontend verificam navegação, validação, isolamento das prévias de chamadas de rede, modelos de descrição e suspensão dos campos/anexos do App desativado. A conferência visual complementa esses testes.

Resultado desta revisão: **88 testes aprovados em 11 suítes**, ESLint sem erros e build de produção concluído com `CI=true`. Navegação por setas conferida no navegador em Vendas, Webpresence, Recarga-Fácil e App, inclusive no modal. Confirmados App fechado ao abrir, descrições vazias e preenchimento dos modelos somente pelo botão. Nenhum erro de console foi observado na aba de conferência.
