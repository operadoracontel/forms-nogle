# Banco de dados

Banco **conteltelecom** (SQL Server) — o enum `BancoSql.Contel` do ERP aponta para esse
catálogo; não existe banco chamado "Contel". DDL completo, com bloco de rollback, em
[`sql/2026-08-10-formulario-marca.sql`](sql/2026-08-10-formulario-marca.sql). A migração
que trocou a tabela própria de anexos pela `AG_ANEXOS_GERAL` está em
[`sql/2026-08-11-anexos-via-ag-anexos-geral.sql`](sql/2026-08-11-anexos-via-ag-anexos-geral.sql)
— só precisa rodar em ambiente que já tinha a versão anterior (o dev1).

São **4 tabelas**: `FORMULARIO_MARCA`, `FORMULARIO_MARCA_RESPOSTA`,
`FORMULARIO_MARCA_PRODUTO` e `FORMULARIO_MARCA_ACESSO` (auditoria de leitura da senha,
criada por [`sql/2026-08-11-auditoria-acesso-senha.sql`](sql/2026-08-11-auditoria-acesso-senha.sql)).
Os anexos usam a `AG_ANEXOS_GERAL` do ERP.

Convenções seguidas (padrão do ERP): `BIGINT` em vez de `INT`, `NVARCHAR` em vez de
`VARCHAR`, `st_*` como `BIT` e sufixo do nome da tabela nas colunas — exceto
`id_PS_PESSOA_inc` / `id_PS_PESSOA_alt`, que no ERP vão sempre sem sufixo.

## `FORMULARIO_MARCA` — o link

Um registro por link gerado. É aqui que mora a trava de duplicidade.

| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id_FORMULARIO_MARCA` | BIGINT identity | PK |
| `id_FRANQUIA_MARCA_PROPRIA` | BIGINT | Marca dona do link |
| `token_FORMULARIO_MARCA` | NVARCHAR(64) | 32 bytes aleatórios em base64url. Índice único |
| `status_FORMULARIO_MARCA` | NVARCHAR(20) | `PENDENTE` \| `CONCLUIDO` \| `CANCELADO` |
| `dtInc_FORMULARIO_MARCA` | DATETIME | Criação |
| `dtAlt_FORMULARIO_MARCA` | DATETIME | Atualizada quando o Cartman fecha o link |
| `dtExpiracao_FORMULARIO_MARCA` | DATETIME | Opcional. Nulo = sem prazo |
| `dtEnvio_FORMULARIO_MARCA` | DATETIME | Preenchida no envio |
| `id_PS_PESSOA_inc` | BIGINT | Quem gerou o link no ERP |
| `id_PS_PESSOA_alt` | BIGINT | Idem no insert; o Cartman não altera (o cliente não tem PS_PESSOA) |
| `ip_envio_FORMULARIO_MARCA` | NVARCHAR(60) | IP de quem enviou |
| `st_FORMULARIO_MARCA` | BIT | Soft delete do registro |

`id_PS_PESSOA_inc` / `id_PS_PESSOA_alt` seguem o padrão do ERP: **sem sufixo da
tabela** (as datas levam sufixo, os ids de pessoa não) e recebem
`Session("id_PS_PESSOA_USUARIO")` — que é `USUARIOS.id_PS_PESSOA`, não `id_USUARIOS`.
As outras três tabelas não têm essas colunas: quem preenche é o cliente da marca,
que não tem registro em `PS_PESSOA`.

Índices: único em `token_FORMULARIO_MARCA`; composto em
`(id_FRANQUIA_MARCA_PROPRIA, status_FORMULARIO_MARCA)`.

### Ciclo de vida

```
GERAR LINK no ERP ─→ PENDENTE ─→ (envio do cliente) ─→ CONCLUIDO
                        │
                        └─→ dtExpiracao no passado ─→ tratado como expirado
```

Clicar em **GERAR LINK** de novo **não cria** um token novo enquanto houver um
`PENDENTE` válido — o ERP reaproveita o existente. Depois de `CONCLUIDO`, o ERP nem
oferece link: mostra a data do envio.

`CANCELADO` está previsto no schema para revogação manual, mas ainda não tem tela.

## `FORMULARIO_MARCA_RESPOSTA` — a resposta

Um registro por link concluído (índice único em `id_FORMULARIO_MARCA`). Colunas
agrupadas por seção do formulário: informações básicas, identidade visual, domínio,
contatos extras e aplicativo white label.

`senha_dominio_FORMULARIO_MARCA_RESPOSTA` é `VARBINARY(MAX)` e guarda o payload
cifrado em AES-256-GCM — nunca texto puro. Ver [07-seguranca.md](07-seguranca.md).

## `FORMULARIO_MARCA_PRODUTO` — produtos contratados

N registros por link. `produto_FORMULARIO_MARCA_PRODUTO` guarda o valor exatamente
como trafega na API (sem acento).

## Arquivos — `AG_ANEXOS_GERAL` (tabela existente do ERP)

Não existe tabela própria de anexos. O logo e o manual de marca vão para
`AG_ANEXOS_GERAL`, a tabela geral de anexos do ERP, e a resposta guarda os ids em
`logo_id_AG_ANEXOS_GERAL` e `manual_marca_id_AG_ANEXOS_GERAL` (INT, porque
`id_AG_ANEXOS_GERAL` é INT e não BIGINT).

Colunas preenchidas: `DESC_AG_ANEXOS_GERAL` (nome original), `caminho_AG_ANEXOS_GERAL`
(URL no S3), `chave_AG_ANEXOS_GERAL` (key), `st_AG_ANEXOS_GERAL` = 1, `dtInc`/`dtAlt`.

Os binários ficam no S3, bucket `s3-contel-imagens-aplicacao`, em
`formulario-marca/<id_FRANQUIA_MARCA_PROPRIA>/<tipo>-<nome>`:

```
formulario-marca/147/logo-minha-operadora.png
formulario-marca/147/manual_marca-guideline.pdf
```

A pasta é o id da marca, para casar direto com o banco na hora de rastrear o arquivo.
O caminho é previsível e o bucket serve objeto publicamente — decisão consciente: o
que sobe para o S3 é só material gráfico. A senha do domínio nunca vai para lá, fica
cifrada em `FORMULARIO_MARCA_RESPOSTA`. Ver [07-seguranca.md](07-seguranca.md).

**Gotcha:** `AG_ANEXOS_GERAL.id_PS_PESSOA_inc` e `_alt` são **NOT NULL**, e quem envia
o formulário é o cliente da marca, que não tem `PS_PESSOA`. Grava-se o
`id_PS_PESSOA_inc` de quem gerou o link no ERP (vem de `FORMULARIO_MARCA`), com
fallback `0`. É melhor que o `880` hardcoded que o `NfeEnotas.vb` usa nesse mesmo caso.

O tamanho do arquivo deixou de ser guardado — `AG_ANEXOS_GERAL` não tem essa coluna.
Os limites de tipo e tamanho continuam sendo validados no upload.

## Consultas úteis

Marcas que já enviaram:

```sql
SELECT FMP.nome_FRANQUIA_MARCA_PROPRIA,
       FM.dtEnvio_FORMULARIO_MARCA,
       FMR.whatsapp_resp_FORMULARIO_MARCA_RESPOSTA,
       FMR.site_FORMULARIO_MARCA_RESPOSTA
FROM FORMULARIO_MARCA FM WITH (NOLOCK)
INNER JOIN FORMULARIO_MARCA_RESPOSTA FMR WITH (NOLOCK)
    ON FMR.id_FORMULARIO_MARCA = FM.id_FORMULARIO_MARCA
LEFT JOIN FRANQUIA_MARCA_PROPRIA FMP WITH (NOLOCK)
    ON FMP.id_FRANQUIA_MARCA_PROPRIA = FM.id_FRANQUIA_MARCA_PROPRIA
WHERE FM.status_FORMULARIO_MARCA = 'CONCLUIDO'
ORDER BY FM.dtEnvio_FORMULARIO_MARCA DESC;
```

Links gerados e ainda não preenchidos:

```sql
SELECT FMP.nome_FRANQUIA_MARCA_PROPRIA,
       FM.dtInc_FORMULARIO_MARCA,
       FM.id_PS_PESSOA_inc
FROM FORMULARIO_MARCA FM WITH (NOLOCK)
LEFT JOIN FRANQUIA_MARCA_PROPRIA FMP WITH (NOLOCK)
    ON FMP.id_FRANQUIA_MARCA_PROPRIA = FM.id_FRANQUIA_MARCA_PROPRIA
WHERE FM.status_FORMULARIO_MARCA = 'PENDENTE'
  AND FM.st_FORMULARIO_MARCA = 1
ORDER BY FM.dtInc_FORMULARIO_MARCA DESC;
```
