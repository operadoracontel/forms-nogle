/* ============================================================================
   NOGLE-27602 — Formulario de onboarding de marca
   Banco: Contel (SQL Server)
   Data:  2026-08-10

   Convencoes do ERP: BIGINT (nao INT), NVARCHAR (nao VARCHAR), st_* como BIT,
   sufixo do nome da tabela em cada coluna.

   ROLLBACK: ver bloco no final do arquivo.
   ============================================================================ */

/* ---------------------------------------------------------------------------
   1) Link do formulario (token opaco por marca)
   status_FORMULARIO_MARCA: PENDENTE | CONCLUIDO | CANCELADO

   id_PS_PESSOA_inc / id_PS_PESSOA_alt seguem o padrao do ERP (sem sufixo da
   tabela) e recebem Session("id_PS_PESSOA_USUARIO") de quem gerou o link.
   As demais tabelas nao tem essas colunas: quem preenche o formulario e o
   cliente da marca, que nao tem PS_PESSOA no sistema.
   --------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.FORMULARIO_MARCA', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.FORMULARIO_MARCA (
        id_FORMULARIO_MARCA              BIGINT IDENTITY(1,1) NOT NULL,
        id_FRANQUIA_MARCA_PROPRIA        BIGINT         NOT NULL,
        token_FORMULARIO_MARCA           NVARCHAR(64)   NOT NULL,
        status_FORMULARIO_MARCA          NVARCHAR(20)   NOT NULL
            CONSTRAINT DF_FORMULARIO_MARCA_status DEFAULT (N'PENDENTE'),
        dtInc_FORMULARIO_MARCA           DATETIME       NOT NULL
            CONSTRAINT DF_FORMULARIO_MARCA_dtInc DEFAULT (GETDATE()),
        dtAlt_FORMULARIO_MARCA           DATETIME       NULL,
        dtExpiracao_FORMULARIO_MARCA     DATETIME       NULL,
        dtEnvio_FORMULARIO_MARCA         DATETIME       NULL,
        id_PS_PESSOA_inc                 BIGINT         NULL,
        id_PS_PESSOA_alt                 BIGINT         NULL,
        ip_envio_FORMULARIO_MARCA        NVARCHAR(60)   NULL,
        st_FORMULARIO_MARCA              BIT            NOT NULL
            CONSTRAINT DF_FORMULARIO_MARCA_st DEFAULT (1),
        CONSTRAINT PK_FORMULARIO_MARCA PRIMARY KEY CLUSTERED (id_FORMULARIO_MARCA)
    );

    CREATE UNIQUE NONCLUSTERED INDEX UX_FORMULARIO_MARCA_token
        ON dbo.FORMULARIO_MARCA (token_FORMULARIO_MARCA);

    CREATE NONCLUSTERED INDEX IX_FORMULARIO_MARCA_marca_status
        ON dbo.FORMULARIO_MARCA (id_FRANQUIA_MARCA_PROPRIA, status_FORMULARIO_MARCA)
        INCLUDE (token_FORMULARIO_MARCA, dtExpiracao_FORMULARIO_MARCA, st_FORMULARIO_MARCA);
END
GO

/* ---------------------------------------------------------------------------
   2) Resposta enviada (1:1 com o link concluido)
   senha_dominio_FORMULARIO_MARCA_RESPOSTA guarda o payload cifrado
   (AES-256-GCM). NUNCA gravar a senha em texto puro nesta coluna.
   --------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.FORMULARIO_MARCA_RESPOSTA', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.FORMULARIO_MARCA_RESPOSTA (
        id_FORMULARIO_MARCA_RESPOSTA               BIGINT IDENTITY(1,1) NOT NULL,
        id_FORMULARIO_MARCA                        BIGINT         NOT NULL,

        /* 1. Informacoes basicas */
        nome_empresa_FORMULARIO_MARCA_RESPOSTA     NVARCHAR(200)  NOT NULL,
        whatsapp_resp_FORMULARIO_MARCA_RESPOSTA    NVARCHAR(30)   NOT NULL,

        /* 2. Identidade visual */
        cor_principal_FORMULARIO_MARCA_RESPOSTA    NVARCHAR(20)   NULL,
        cor_secundaria_FORMULARIO_MARCA_RESPOSTA   NVARCHAR(20)   NULL,

        /* 3. Dominio e acesso */
        site_FORMULARIO_MARCA_RESPOSTA             NVARCHAR(300)  NULL,
        registrador_FORMULARIO_MARCA_RESPOSTA      NVARCHAR(200)  NULL,
        login_dominio_FORMULARIO_MARCA_RESPOSTA    NVARCHAR(200)  NULL,
        senha_dominio_FORMULARIO_MARCA_RESPOSTA    VARBINARY(MAX) NULL,
        obs_dominio_FORMULARIO_MARCA_RESPOSTA      NVARCHAR(MAX)  NULL,

        /* 4. Contatos extras */
        telefone_0800_FORMULARIO_MARCA_RESPOSTA    NVARCHAR(30)   NULL,
        whatsapp_marca_FORMULARIO_MARCA_RESPOSTA   NVARCHAR(30)   NULL,

        /* 5. Aplicativo white label */
        app_nome_FORMULARIO_MARCA_RESPOSTA         NVARCHAR(200)  NULL,
        app_endereco_FORMULARIO_MARCA_RESPOSTA     NVARCHAR(400)  NULL,
        app_cor_1_FORMULARIO_MARCA_RESPOSTA        NVARCHAR(20)   NULL,
        app_cor_2_FORMULARIO_MARCA_RESPOSTA        NVARCHAR(20)   NULL,
        app_desc_curta_FORMULARIO_MARCA_RESPOSTA   NVARCHAR(400)  NULL,
        app_desc_longa_FORMULARIO_MARCA_RESPOSTA   NVARCHAR(MAX)  NULL,

        /* Arquivos: ficam na AG_ANEXOS_GERAL (tabela geral de anexos do ERP).
           INT porque id_AG_ANEXOS_GERAL e INT, nao BIGINT. */
        logo_id_AG_ANEXOS_GERAL                    INT            NULL,
        manual_marca_id_AG_ANEXOS_GERAL            INT            NULL,

        dtInc_FORMULARIO_MARCA_RESPOSTA            DATETIME       NOT NULL
            CONSTRAINT DF_FORMULARIO_MARCA_RESPOSTA_dtInc DEFAULT (GETDATE()),

        CONSTRAINT PK_FORMULARIO_MARCA_RESPOSTA PRIMARY KEY CLUSTERED (id_FORMULARIO_MARCA_RESPOSTA),
        CONSTRAINT FK_FORMULARIO_MARCA_RESPOSTA_FORMULARIO_MARCA
            FOREIGN KEY (id_FORMULARIO_MARCA) REFERENCES dbo.FORMULARIO_MARCA (id_FORMULARIO_MARCA)
    );

    CREATE UNIQUE NONCLUSTERED INDEX UX_FORMULARIO_MARCA_RESPOSTA_formulario
        ON dbo.FORMULARIO_MARCA_RESPOSTA (id_FORMULARIO_MARCA);
END
GO

/* ---------------------------------------------------------------------------
   3) Produtos contratados (N por resposta)
   --------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.FORMULARIO_MARCA_PRODUTO', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.FORMULARIO_MARCA_PRODUTO (
        id_FORMULARIO_MARCA_PRODUTO       BIGINT IDENTITY(1,1) NOT NULL,
        id_FORMULARIO_MARCA               BIGINT        NOT NULL,
        produto_FORMULARIO_MARCA_PRODUTO  NVARCHAR(60)  NOT NULL,
        CONSTRAINT PK_FORMULARIO_MARCA_PRODUTO PRIMARY KEY CLUSTERED (id_FORMULARIO_MARCA_PRODUTO),
        CONSTRAINT FK_FORMULARIO_MARCA_PRODUTO_FORMULARIO_MARCA
            FOREIGN KEY (id_FORMULARIO_MARCA) REFERENCES dbo.FORMULARIO_MARCA (id_FORMULARIO_MARCA)
    );

    CREATE NONCLUSTERED INDEX IX_FORMULARIO_MARCA_PRODUTO_formulario
        ON dbo.FORMULARIO_MARCA_PRODUTO (id_FORMULARIO_MARCA);
END
GO

/* ---------------------------------------------------------------------------
   4) Arquivos enviados (logo, manual de marca)

   NAO existe tabela propria: os arquivos vao para dbo.AG_ANEXOS_GERAL, a tabela
   geral de anexos do ERP, e a resposta guarda os ids em
   logo_id_AG_ANEXOS_GERAL / manual_marca_id_AG_ANEXOS_GERAL.

   AG_ANEXOS_GERAL exige id_PS_PESSOA_inc / id_PS_PESSOA_alt NOT NULL; como quem
   envia o formulario e o cliente da marca (sem PS_PESSOA), grava-se o
   id_PS_PESSOA_inc de quem gerou o link no ERP.
   --------------------------------------------------------------------------- */

/* ============================================================================
   ROLLBACK (executar na ordem — dependencias de FK)

   DROP TABLE dbo.FORMULARIO_MARCA_PRODUTO;
   DROP TABLE dbo.FORMULARIO_MARCA_RESPOSTA;
   DROP TABLE dbo.FORMULARIO_MARCA;

   Os anexos gravados em AG_ANEXOS_GERAL nao sao removidos por este rollback:
   sao dados compartilhados com o resto do ERP. Para limpar so os do formulario,
   usar os ids guardados em FORMULARIO_MARCA_RESPOSTA ANTES do drop.
   ============================================================================ */
