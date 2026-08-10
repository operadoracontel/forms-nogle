# Segurança

## Por que não há login

O formulário é preenchido pelo cliente da marca, que não tem usuário no ERP. Criar
login para isso adicionaria fricção num fluxo de uso único. A credencial é o token
do link.

## Token do link

- 32 bytes de `RNGCryptoServiceProvider` (ERP), codificados em base64url — 43
  caracteres, ~256 bits de entropia. Não é derivado do `id` da marca, então não dá
  para adivinhar nem enumerar.
- Índice único em `token_FORMULARIO_MARCA`.
- Vale para **um envio**. Depois de `CONCLUIDO`, o mesmo token só devolve `409`.
- `dtExpiracao_FORMULARIO_MARCA` permite prazo; nulo = sem prazo.
- `st_FORMULARIO_MARCA = 0` revoga o link.

O que o token dá acesso a: o nome da marca e o formulário em branco. Nada de dados
financeiros, base de clientes ou qualquer outra tela.

## Trava de duplicidade

Duas camadas:

1. **Por marca** — antes de aceitar o envio, o Cartman consulta se existe qualquer
   link daquela marca com status `CONCLUIDO`. Se existir, recusa com `409` mesmo que
   alguém tenha gerado um link novo.
2. **Por link, contra corrida** — a gravação começa com
   `UPDATE FORMULARIO_MARCA SET status = 'CONCLUIDO' WHERE id = @id AND status = 'PENDENTE'`
   dentro da transação. Zero linhas afetadas significa que outro envio chegou antes:
   rollback e `409`. Dois cliques simultâneos não geram duas respostas.

## Credenciais do registrador de domínio

A seção 3 coleta login e senha do painel onde o domínio foi registrado. **Isso é
credencial de terceiro** e exige cuidado permanente:

- A senha é cifrada com **AES-256-GCM** antes de chegar ao banco
  (`cartman/src/modules/brandFormCryptoModule.js`). O buffer gravado é
  `[iv 12 bytes][authTag 16 bytes][ciphertext]`, em coluna `VARBINARY(MAX)`.
- A chave vem de `BRAND_FORM_ENCRYPTION_KEY` (32 bytes em hex, 64 caracteres) e
  **não pode** ficar no repositório. Gerar com:

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- O módulo falha explicitamente se a chave estiver ausente ou com tamanho errado —
  melhor quebrar do que gravar em claro.
- O payload do formulário **nunca** deve ser logado. Os logs de erro do controller
  registram só a mensagem da exceção.
- Não existe endpoint de leitura da senha. Quem precisar do acesso decifra por
  processo controlado, com `decryptSecret`.

### Recomendações de operação

- Trocar a chave exige redecifrar as senhas existentes — planejar antes de rotacionar.
- Combinar com purga: depois que o domínio for apontado, limpar
  `senha_dominio_FORMULARIO_MARCA_RESPOSTA` reduz a janela de exposição.
- Sempre que possível, orientar o cliente pelo campo de observações a criar um
  **usuário convidado** no painel em vez de entregar a senha principal.

## Superfície pública

- As rotas `/brand-form/:token` não usam o middleware `auth` — é intencional e está
  comentado no `router.js` do Cartman.
- Uploads restritos por MIME type e limitados a 20MB por arquivo; o nome do arquivo é
  sanitizado antes de virar chave no S3.
- `robots.txt` bloqueia indexação e o HTML traz `noindex, nofollow`.
- `public/.htaccess` aplica HSTS, `X-Frame-Options`, `X-Content-Type-Options`, CSP com
  `frame-ancestors 'self'` e `form-action 'self'`, além de no-cache.
