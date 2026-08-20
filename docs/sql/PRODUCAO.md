# Subir para produção — banco

Runbook do banco. Os passos de aplicação (chave de cifra, Web.config, build, deploy)
estão no final, como referência.

Banco: **`conteltelecom`** — o enum `BancoSql.Contel` do ERP aponta para esse catálogo.
Não existe banco chamado "Contel".

---

## Quais scripts rodar

| Script | Produção? | O que faz |
| --- | --- | --- |
| `2026-08-10-formulario-marca.sql` | ✅ **sim** | Cria `FORMULARIO_MARCA`, `_RESPOSTA` e `_PRODUTO` |
| `2026-08-11-auditoria-acesso-senha.sql` | ✅ **sim** | Cria `FORMULARIO_MARCA_ACESSO` |
| `2026-08-11-anexos-via-ag-anexos-geral.sql` | ❌ **não** | Migração só para ambiente que rodou a versão antiga (o dev1) |

O terceiro é inofensivo se rodado por engano — tem guarda de `IF OBJECT_ID` e
`COL_LENGTH`, então não faz nada num banco que já nasceu correto. Mas não precisa.

**Ordem importa** (dependência de FK): o de auditoria referencia `FORMULARIO_MARCA`.

---

## Comandos

```bash
sqlcmd -S <host_prod> -U <usuario> -P "<senha>" -d conteltelecom -f 65001 -b \
  -i "docs/sql/2026-08-10-formulario-marca.sql"
```

```bash
sqlcmd -S <host_prod> -U <usuario> -P "<senha>" -d conteltelecom -f 65001 -b \
  -i "docs/sql/2026-08-11-auditoria-acesso-senha.sql"
```

- `-f 65001` é obrigatório: sem ele o acento dos comentários corrompe.
- `-b` faz o sqlcmd sair com erro se algo falhar, em vez de seguir em silêncio.
- Os dois scripts são **idempotentes** (`IF OBJECT_ID ... IS NULL`): rodar duas vezes
  não quebra nem duplica.

---

## Verificação

```sql
SELECT t.name AS tabela, COUNT(c.column_id) AS colunas
FROM sys.tables t WITH (NOLOCK)
JOIN sys.columns c WITH (NOLOCK) ON c.object_id = t.object_id
WHERE t.name LIKE 'FORMULARIO_MARCA%'
GROUP BY t.name
ORDER BY t.name;
```

Esperado:

```
FORMULARIO_MARCA            12
FORMULARIO_MARCA_ACESSO      7
FORMULARIO_MARCA_PRODUTO     3
FORMULARIO_MARCA_RESPOSTA   22
```

Índices e chaves estrangeiras:

```sql
SELECT COUNT(*) AS indices
FROM sys.indexes i WITH (NOLOCK)
JOIN sys.tables t WITH (NOLOCK) ON t.object_id = i.object_id
WHERE t.name LIKE 'FORMULARIO_MARCA%' AND i.name IS NOT NULL;

SELECT COUNT(*) AS fks
FROM sys.foreign_keys fk WITH (NOLOCK)
JOIN sys.tables t WITH (NOLOCK) ON t.object_id = fk.parent_object_id
WHERE t.name LIKE 'FORMULARIO_MARCA%';
```

Esperado: **10 índices** e **3 FKs**.

> Esses números foram conferidos rodando os dois scripts num banco limpo e comparando,
> coluna a coluna, com o schema do dev1 (que chegou lá por migração). O `diff` deu
> vazio — o caminho de instalação limpa produz exatamente o mesmo resultado.

---

## O que os scripts NÃO fazem

- **Não tocam em `AG_ANEXOS_GERAL`.** Os anexos do formulário usam a tabela geral de
  anexos do ERP, que já existe. A seta é da nossa tabela para ela, nunca o contrário, e
  não há FK.
- **Não criam** `FORMULARIO_MARCA_ARQUIVO`. Essa tabela existiu numa versão inicial e
  foi descartada em favor da `AG_ANEXOS_GERAL`.
- **Não inserem dado** nenhum.

---

## Rollback

Na ordem, por causa das FKs:

```sql
DROP TABLE dbo.FORMULARIO_MARCA_ACESSO;
DROP TABLE dbo.FORMULARIO_MARCA_PRODUTO;
DROP TABLE dbo.FORMULARIO_MARCA_RESPOSTA;
DROP TABLE dbo.FORMULARIO_MARCA;
```

Cada script também traz o próprio bloco de rollback no final do arquivo.

Anexos já enviados ao S3 **não** são removidos por este rollback — são dados
compartilhados com o resto do ERP. Para limpar só os do formulário, usar os ids
guardados em `FORMULARIO_MARCA_RESPOSTA` **antes** do drop.

---

## Resto do checklist de produção

Fora do banco, na ordem:

1. **Chave de cifra** no `.env` do Cartman de produção:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Adicionar como `BRAND_FORM_ENCRYPTION_KEY` e reiniciar o processo (`dotenv` lê no
   boot). Guardar num cofre: sem backup, chave perdida é senha perdida. Ver
   [../07-seguranca.md](../07-seguranca.md).

2. **`BaseURLFormularioMarca`** no `Web.config` de produção, terminando com barra. O
   arquivo é gitignored, então é aplicação manual. Ver
   [../08-erp-integracao.md](../08-erp-integracao.md).

3. **Build e deploy do sistema-contel** — o code-behind compila na DLL.

4. **Bucket S3 + CloudFront** para o front, e subdomínio apontado.

5. **Deploy do Cartman** com a `master` atualizada.

Sem o passo 1 o envio falha na hora de gravar a senha. Sem o 2 o link sai quebrado.
