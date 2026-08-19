/* ============================================================================
   NOGLE-27602 — Auditoria de acesso a senha do registrador de dominio
   Banco: conteltelecom (SQL Server)
   Data:  2026-08-11

   A senha do painel de dominio e credencial de terceiro guardada cifrada
   (AES-256-GCM). Como a chave vive no .env do servidor, a defesa principal
   contra uso indevido interno e a trilha: toda leitura e toda purga ficam
   registradas aqui, com pessoa, IP e data.

   acao_FORMULARIO_MARCA_ACESSO: LEITURA | PURGA
   Registra tambem tentativa que nao retornou senha (ja purgada ou nunca
   informada) — tentativa de acesso e informacao relevante numa investigacao.

   O identificador de quem acessou e o EMAIL, nao o id: o Cartman tem dois
   fluxos de login (/authenticate devolve id_PS_PESSOA do Contel,
   /comercial/login devolve o id da USUARIOS_MONITOR_NOGLE), entao o campo `id`
   do token e ambiguo. id_PS_PESSOA_inc fica como apoio, podendo vir nulo.

   OBRIGATORIA: o endpoint GET /brand-form/brand/:brandId/domain-access grava
   nesta tabela ANTES de devolver a senha. Sem ela, a leitura falha.

   ROLLBACK: ver bloco no final do arquivo.
   ============================================================================ */

IF OBJECT_ID('dbo.FORMULARIO_MARCA_ACESSO', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.FORMULARIO_MARCA_ACESSO (
        id_FORMULARIO_MARCA_ACESSO    BIGINT IDENTITY(1,1) NOT NULL,
        id_FORMULARIO_MARCA           BIGINT        NOT NULL,
        acao_FORMULARIO_MARCA_ACESSO  NVARCHAR(20)  NOT NULL,
        email_FORMULARIO_MARCA_ACESSO NVARCHAR(200) NULL,
        id_PS_PESSOA_inc              BIGINT        NULL,
        ip_FORMULARIO_MARCA_ACESSO    NVARCHAR(60)  NULL,
        dtInc_FORMULARIO_MARCA_ACESSO DATETIME      NOT NULL
            CONSTRAINT DF_FORMULARIO_MARCA_ACESSO_dtInc DEFAULT (GETDATE()),
        CONSTRAINT PK_FORMULARIO_MARCA_ACESSO PRIMARY KEY CLUSTERED (id_FORMULARIO_MARCA_ACESSO),
        CONSTRAINT FK_FORMULARIO_MARCA_ACESSO_FORMULARIO_MARCA
            FOREIGN KEY (id_FORMULARIO_MARCA) REFERENCES dbo.FORMULARIO_MARCA (id_FORMULARIO_MARCA)
    );

    CREATE NONCLUSTERED INDEX IX_FORMULARIO_MARCA_ACESSO_formulario
        ON dbo.FORMULARIO_MARCA_ACESSO (id_FORMULARIO_MARCA, dtInc_FORMULARIO_MARCA_ACESSO);

    CREATE NONCLUSTERED INDEX IX_FORMULARIO_MARCA_ACESSO_email
        ON dbo.FORMULARIO_MARCA_ACESSO (email_FORMULARIO_MARCA_ACESSO, dtInc_FORMULARIO_MARCA_ACESSO);
END
GO

/* ============================================================================
   ROLLBACK

   DROP TABLE dbo.FORMULARIO_MARCA_ACESSO;
   ============================================================================ */
