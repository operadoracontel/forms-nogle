# Integração com o ERP (sistema-contel)

O link é gerado dentro do ERP, na tela **Detalhes da Marca**.

Arquivos alterados em `conteltelecom/web/franquia/marcas/`:

- `detalhes-marca.aspx` — card **FORMULÁRIO DE ONBOARDING**, modal com o link e
  função JS de copiar.
- `detalhes-marca.aspx.vb` — handler do botão e funções de token.
- `detalhes-marca.aspx.designer.vb` — declaração dos controles adicionados.

E em `conteltelecom/Web.config`:

```xml
<add key="BaseURLFormularioMarca" value="https://formulario.nogle.tech/" />
```

A URL final é `BaseURLFormularioMarca & token` — por isso o valor precisa terminar
com barra.

## Comportamento do botão

`ButtonFormularioMarca_Click`:

1. `Busca_data_envio_formulario_marca` — se a marca já tem link `CONCLUIDO`, o modal
   mostra a data do envio e **não** oferece link novo.
2. `Busca_token_formulario_marca_pendente` — reaproveita o token `PENDENTE` válido
   (ativo e dentro do prazo), para o time não gerar links duplicados sem querer.
3. `Gera_token_formulario_marca` — só quando não há pendente: gera o token com
   `Gera_token_seguro_formulario_marca` (32 bytes de `RNGCryptoServiceProvider`
   em base64url) e insere em `FORMULARIO_MARCA` com status `PENDENTE`.
4. Abre o modal via `ScriptManager.RegisterStartupScript` (Bootstrap 5, mesmo padrão
   dos outros modais da tela).

## Visibilidade

O card nasce com `visible="false"` no `.aspx` e só é ligado no `Page_Load` para os
usuários da whitelist já existente na tela (a mesma que controla
`areaConfiguracoesMarca`). Gerar link de onboarding é ação de time interno.

## Build

`detalhes-marca.aspx.vb` é `CodeBehind` — está compilado na DLL do projeto. Depois de
alterar o code-behind ou o designer é **obrigatório** compilar pelo Visual Studio ou
MSBuild antes de testar; sem isso o ASP.NET usa a DLL antiga e o erro típico é
"X is not a member of Y".

## Encoding

Os três arquivos da tela são UTF-8 **com BOM** e CRLF. Manter — sem BOM o ASP.NET
falha ao interpretar acentos e ao carregar o tipo da classe.
