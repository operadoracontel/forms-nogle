# Banco de dados

Banco **Contel** (SQL Server). DDL completo, com bloco de rollback, em
[`sql/2026-08-10-formulario-marca.sql`](sql/2026-08-10-formulario-marca.sql).

Convenções seguidas (padrão do ERP): `BIGINT` em vez de `INT`, `NVARCHAR` em vez de
`VARCHAR`, `st_*` como `BIT` e sufixo do nome da tabela em cada coluna.

## `FORMULARIO_MARCA` — o link

Um registro por link gerado. É aqui que mora a trava de duplicidade.

| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id_FORMULARIO_MARCA` | BIGINT identity | PK |
| `id_FRANQUIA_MARCA_PROPRIA` | BIGINT | Marca dona do link |
| `token_FORMULARIO_MARCA` | NVARCHAR(64) | 32 bytes aleatórios em base64url. Índice único |
| `status_FORMULARIO_MARCA` | NVARCHAR(20) | `PENDENTE` \| `CONCLUIDO` \| `CANCELADO` |
| `dtInc_FORMULARIO_MARCA` | DATETIME | Criação |
| `dtExpiracao_FORMULARIO_MARCA` | DATETIME | Opcional. Nulo = sem prazo |
| `dtEnvio_FORMULARIO_MARCA` | DATETIME | Preenchida no envio |
| `id_USUARIOS_inc_FORMULARIO_MARCA` | BIGINT | Quem gerou o link no ERP |
| `ip_envio_FORMULARIO_MARCA` | NVARCHAR(60) | IP de quem enviou |
| `st_FORMULARIO_MARCA` | BIT | Soft delete do registro |

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

## `FORMULARIO_MARCA_ARQUIVO` — logo e manual

N registros por link. `tipo_FORMULARIO_MARCA_ARQUIVO` é `LOGO` ou `MANUAL_MARCA`.
Os arquivos ficam no S3 (`formulario-marca/<id_marca>/<tipo>-<nome>`); a tabela
guarda chave, URL, nome original e tamanho.

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
       FM.id_USUARIOS_inc_FORMULARIO_MARCA
FROM FORMULARIO_MARCA FM WITH (NOLOCK)
LEFT JOIN FRANQUIA_MARCA_PROPRIA FMP WITH (NOLOCK)
    ON FMP.id_FRANQUIA_MARCA_PROPRIA = FM.id_FRANQUIA_MARCA_PROPRIA
WHERE FM.status_FORMULARIO_MARCA = 'PENDENTE'
  AND FM.st_FORMULARIO_MARCA = 1
ORDER BY FM.dtInc_FORMULARIO_MARCA DESC;
```
