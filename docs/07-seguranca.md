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

### Leitura da senha

Hash não serve aqui: a equipe precisa do texto original para apontar o DNS. Como a
cifra é reversível por necessidade, o controle real é *quem lê* e *fica registrado*.

| Método | Rota | Uso |
| --- | --- | --- |
| GET | `/brand-form/brand/:brandId/domain-access` | Registrador, site, login, senha decifrada e observações. |
| DELETE | `/brand-form/brand/:brandId/domain-access` | Zera a senha depois do domínio apontado. Idempotente. |

Ambas exigem `auth` **e** `brandFormMiddleware.requireBrandFormAdmin`, que resolve o
papel em `USUARIOS_MONITOR_NOGLE` (banco `nogle`, via `getColaboradorByEmail`) e exige
`isWhitelisted` e `isAdmin`. Quem não é admin leva `403` mesmo com JWT válido — o gate
é no backend porque checagem só de UI não protege endpoint.

As duas gravam em `FORMULARIO_MARCA_ACESSO` — ação (`LEITURA`/`PURGA`), email, IP e
data — **antes** de responder. Se o registro falhar, a leitura falha junto: não existe
caminho onde alguém vê a senha sem ficar registrado. Tentativa que não encontrou senha
também é registrada.

> **Por que o identificador é o email:** o Cartman tem dois fluxos de login.
> `/authenticate` emite `{ id: id_PS_PESSOA }` (Contel) e `/comercial/login` emite o
> `id` da `USUARIOS_MONITOR_NOGLE` — tabelas diferentes no mesmo campo do token. O
> email é o único comum aos dois, então é ele que gate e auditoria usam. O
> `middlewares/auth.js` expõe `req.userEmail` para isso.

### Recomendações de operação

- Trocar a chave exige redecifrar as senhas existentes — planejar antes de rotacionar.
  A chave não tem backup: perdê-la é perder as senhas.
- Purgar a senha assim que o domínio for apontado (`DELETE` acima). Cada senha apagada
  é risco eliminado, não mitigado.
- Auditar periodicamente `FORMULARIO_MARCA_ACESSO`: leitura sem purga na sequência, ou
  muitas leituras da mesma pessoa, merecem pergunta.
- **A medida mais forte é não guardar.** Orientar o cliente, pelo campo de observações,
  a criar um **usuário convidado** no painel do registrador em vez de entregar a senha
  principal. Acesso delegado é revogável e não expõe a conta.

## Validação da segurança

Suite executada em 11/08/2026 contra o **banco local** (Docker, `conteltelecom` e
`nogle` restaurados), com o Cartman apontado para `localhost`. Todos passaram:

| # | Cenário | Esperado | Resultado |
| --- | --- | --- | --- |
| 1 | Executável (header `MZ`) renomeado para `.png`, com `Content-Type: image/png` | rejeitar | `400` — "O conteudo do logo nao corresponde a um PNG, JPG ou PDF" |
| 2 | Arquivo de 25MB | rejeitar sem estourar memória | `413` |
| 3 | Link com `dtExpiracao` no passado | bloquear | `410 EXPIRED` |
| 4 | 62 leituras seguidas do mesmo IP | frear | `429` na 60ª, com `Retry-After: 578` |
| 5 | `' OR 1=1--` e `'; DROP TABLE FORMULARIO_MARCA;--` no token | tratar como texto | `404`; as 4 tabelas intactas |
| 6 | Campo de texto com 300 mil caracteres | rejeitar | `413` |
| 7 | Envio válido com PNG legítimo | aceitar | `201` |
| 8 | Reenvio no mesmo link | bloquear | `409` |
| 9 | Dados da marca sem token | negar | `401` |
| 10 | JWT com assinatura forjada | negar | `401` |
| 11 | Dados da marca com JWT válido | sem senha/login no corpo | confirmado |
| 12 | Senha do domínio como não-admin | negar | `403` |
| 13 | Senha do domínio como admin | decifrar | texto original recuperado |
| 14 | Purga como não-admin | negar | `403` |
| 15 | Purga como admin | zerar | `200`, coluna `NULL` |
| 16 | Auditoria | registrar | `LEITURA` e `PURGA` com email e IP |

Os dados de teste e o objeto que subiu ao S3 foram removidos depois da suite.

## Superfície pública

- As rotas `/brand-form/:token` não usam o middleware `auth` — é intencional e está
  comentado no `router.js` do Cartman.
- Upload limitado **no multer**, antes de bufferizar em memória: 20MB por arquivo, 2
  arquivos, 256KB por campo de texto. Sem isso a rota pública seria um vetor de
  esgotamento de memória — o arquivo inteiro entraria na RAM antes de qualquer checagem.
  Estouro devolve `413`.
- Tipo do arquivo conferido em **duas** camadas: o `mimetype` declarado pelo cliente e a
  **assinatura real do conteúdo** (magic bytes — PNG `89 50 4E 47 0D 0A 1A 0A`, JPG
  `FF D8 FF`, PDF `%PDF`, ZIP `PK`). Só o mimetype não bastaria: ele é declarado no
  multipart e forjável, e o bucket é público — daria para hospedar conteúdo arbitrário
  num domínio da Nogle.
- O nome do arquivo é sanitizado antes de virar chave no S3.
- Erro `500` devolve mensagem genérica. O detalhe fica só no `console.error`, para não
  vazar nome de tabela, coluna ou servidor numa falha de SQL.
- **Rate limit por IP** nas rotas públicas, janela deslizante de 10 minutos:
  60 leituras e 10 envios. Estouro devolve `429` com `Retry-After`.
  O contador é em memória, então é **por processo** — sob PM2 em cluster cada worker tem
  o seu. Serve de amortecedor; o limite global deveria vir do proxy/WAF na frente.
  O próprio mapa de contadores tem teto (10 mil IPs) e varredura, senão viraria o
  vetor de memória que ele deveria impedir.
- **Link expira em 30 dias** (`dtExpiracao_FORMULARIO_MARCA`, preenchido no ERP).
  Link vazado deixa de funcionar sozinho; o Cartman devolve `410 EXPIRED`.
- `robots.txt` bloqueia indexação e o HTML traz `noindex, nofollow`.
- `public/.htaccess` aplica HSTS, `X-Frame-Options`, `X-Content-Type-Options`, CSP com
  `frame-ancestors 'self'` e `form-action 'self'`, além de no-cache.

### Anexos no S3

O bucket `s3-contel-imagens-aplicacao` **serve objetos publicamente por URL direta** —
verificado com `curl` sem credencial, resposta `200`. Isso vale para todo o bucket e é
anterior a este projeto.

O que o formulário grava lá é **só material gráfico**: logo e manual de marca. A senha
do registrador nunca sobe para o S3 — fica cifrada no banco.

O caminho é `formulario-marca/<id_FRANQUIA_MARCA_PROPRIA>/<tipo>-<nome>`, previsível
por escolha: facilita rastrear o arquivo a partir do banco. O efeito colateral aceito é
que alguém sondando ids consegue inferir quais marcas têm formulário enviado — perda de
confidencialidade comercial, não de credencial.

Pendente antes de produção: mover esses anexos para um bucket privado com URL assinada
de validade curta.
