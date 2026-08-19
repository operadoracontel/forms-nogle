/* ============================================================================
   NOGLE-27602 — Arquivos do formulario passam a usar AG_ANEXOS_GERAL
   Banco: conteltelecom (SQL Server)
   Data:  2026-08-11

   Aplicar SOMENTE em ambiente que ja rodou o script
   2026-08-10-formulario-marca.sql na versao anterior (com a tabela
   FORMULARIO_MARCA_ARQUIVO). Ambiente novo ja nasce correto pelo script de
   2026-08-10, que foi atualizado.

   Motivo: AG_ANEXOS_GERAL ja e a tabela geral de anexos do ERP e cobre nome,
   caminho, chave do S3, status e auditoria. A tabela propria duplicava isso.

   ROLLBACK: ver bloco no final do arquivo.
   ============================================================================ */

/* ---------------------------------------------------------------------------
   1) Guarda de seguranca: so dropa a tabela se estiver vazia.
   --------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.FORMULARIO_MARCA_ARQUIVO', 'U') IS NOT NULL
BEGIN
    IF EXISTS (SELECT 1 FROM dbo.FORMULARIO_MARCA_ARQUIVO WITH (NOLOCK))
    BEGIN
        RAISERROR ('FORMULARIO_MARCA_ARQUIVO tem registros. Migrar os anexos para AG_ANEXOS_GERAL antes de dropar.', 16, 1);
        RETURN;
    END

    DROP TABLE dbo.FORMULARIO_MARCA_ARQUIVO;
END
GO

/* ---------------------------------------------------------------------------
   2) Ids do anexo na resposta.
   INT (nao BIGINT) porque id_AG_ANEXOS_GERAL e INT.
   --------------------------------------------------------------------------- */
IF COL_LENGTH('dbo.FORMULARIO_MARCA_RESPOSTA', 'logo_id_AG_ANEXOS_GERAL') IS NULL
BEGIN
    ALTER TABLE dbo.FORMULARIO_MARCA_RESPOSTA
        ADD logo_id_AG_ANEXOS_GERAL INT NULL;
END
GO

IF COL_LENGTH('dbo.FORMULARIO_MARCA_RESPOSTA', 'manual_marca_id_AG_ANEXOS_GERAL') IS NULL
BEGIN
    ALTER TABLE dbo.FORMULARIO_MARCA_RESPOSTA
        ADD manual_marca_id_AG_ANEXOS_GERAL INT NULL;
END
GO

/* ============================================================================
   ROLLBACK

   ALTER TABLE dbo.FORMULARIO_MARCA_RESPOSTA DROP COLUMN logo_id_AG_ANEXOS_GERAL;
   ALTER TABLE dbo.FORMULARIO_MARCA_RESPOSTA DROP COLUMN manual_marca_id_AG_ANEXOS_GERAL;

   -- e recriar a tabela antiga, se for mesmo necessario:
   CREATE TABLE dbo.FORMULARIO_MARCA_ARQUIVO (
       id_FORMULARIO_MARCA_ARQUIVO       BIGINT IDENTITY(1,1) NOT NULL,
       id_FORMULARIO_MARCA               BIGINT         NOT NULL,
       tipo_FORMULARIO_MARCA_ARQUIVO     NVARCHAR(30)   NOT NULL,
       nome_FORMULARIO_MARCA_ARQUIVO     NVARCHAR(255)  NOT NULL,
       chave_FORMULARIO_MARCA_ARQUIVO    NVARCHAR(500)  NOT NULL,
       url_FORMULARIO_MARCA_ARQUIVO      NVARCHAR(MAX)  NOT NULL,
       tamanho_FORMULARIO_MARCA_ARQUIVO  BIGINT         NULL,
       dtInc_FORMULARIO_MARCA_ARQUIVO    DATETIME       NOT NULL
           CONSTRAINT DF_FORMULARIO_MARCA_ARQUIVO_dtInc DEFAULT (GETDATE()),
       CONSTRAINT PK_FORMULARIO_MARCA_ARQUIVO PRIMARY KEY CLUSTERED (id_FORMULARIO_MARCA_ARQUIVO),
       CONSTRAINT FK_FORMULARIO_MARCA_ARQUIVO_FORMULARIO_MARCA
           FOREIGN KEY (id_FORMULARIO_MARCA) REFERENCES dbo.FORMULARIO_MARCA (id_FORMULARIO_MARCA)
   );
   CREATE NONCLUSTERED INDEX IX_FORMULARIO_MARCA_ARQUIVO_formulario
       ON dbo.FORMULARIO_MARCA_ARQUIVO (id_FORMULARIO_MARCA);
   ============================================================================ */
