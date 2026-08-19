# Integração com o ERP (sistema-contel)

O link do formulário nasce no ERP, na tela **Detalhes da Marca**. Este documento
descreve tudo que foi alterado lá — o repositório `sistema-contel` não tem
documentação própria deste projeto.

**Escopo total: 3 arquivos, +227 linhas, 0 remoções.** Nenhuma lógica existente foi
alterada; só adição. Branch `NOGLE-27602-formulario-marca`.

| Arquivo | Linhas | O que entrou |
| --- | --- | --- |
| `conteltelecom/web/franquia/marcas/detalhes-marca.aspx` | +60 | Card, modal e função JS de copiar |
| `conteltelecom/web/franquia/marcas/detalhes-marca.aspx.vb` | +113 | Handler do botão e 4 funções |
| `conteltelecom/web/franquia/marcas/detalhes-marca.aspx.designer.vb` | +54 | Declaração dos 6 controles |

---

## 1. `detalhes-marca.aspx`

### Card

Entra no mesmo bloco dos outros cards, ao lado de "CONFIGURAÇÕES DA MARCA":

```
[ícone clipboard]   [ GERAR LINK ]   FORMULÁRIO DE ONBOARDING
```

Nasce com `visible="false"` — quem liga é o code-behind.

### Modal

`ModalFormularioMarca`, Bootstrap 5, mesmo padrão dos modais que a tela já tinha
(`btn-close`, `data-bs-dismiss`). Contém:

- Aviso de que o link aceita **um único envio**
- `TextBoxLinkFormularioMarca` — readonly, com a URL pronta
- Botão **COPIAR**
- `areaStatusFormularioMarca` — mensagem quando a marca já preencheu

### JavaScript

`copiarLinkFormularioMarca()` usa `navigator.clipboard` quando o contexto é seguro e
cai para `document.execCommand('copy')` quando não é (HTTP interno, por exemplo).

---

## 2. `detalhes-marca.aspx.vb`

### Alteração no `Page_Load`

Uma linha, dentro do bloco de whitelist que já existia:

```vb
If listaUsuariosPermitidos.Contains(Session("id_USUARIOS")) = False Then
    areaConfiguracoesMarca.Visible = False
Else
    areaFormularioMarca.Visible = True   ' ← única mudança em código existente
End If
```

O card só aparece para os usuários da lista que a tela já usava para
`areaConfiguracoesMarca`. Gerar link de onboarding é ação de time interno.

### Membros novos (no fim do arquivo, conforme a convenção do projeto)

| Membro | Responsabilidade |
| --- | --- |
| `ButtonFormularioMarca_Click` | Orquestra o fluxo e abre o modal |
| `Busca_data_envio_formulario_marca` | Data do envio, se a marca já concluiu |
| `Busca_token_formulario_marca_pendente` | Reaproveita link pendente válido |
| `Gera_token_formulario_marca` | INSERT em `FORMULARIO_MARCA` |
| `Gera_token_seguro_formulario_marca` | 32 bytes de `RNGCryptoServiceProvider` → base64url |

### Fluxo do clique

```
1. Já existe link CONCLUIDO desta marca?
   SIM → modal mostra "A marca já preencheu o formulário em dd/MM/yyyy HH:mm"
         e não oferece link.
   NÃO ↓
2. Existe link PENDENTE, ativo e dentro do prazo?
   SIM → reaproveita o token existente.
   NÃO ↓
3. Gera token novo e insere como PENDENTE, com validade de 30 dias.
4. Monta a URL: BaseURLFormularioMarca & token
5. Abre o modal via ScriptManager.RegisterStartupScript.
```

O passo 2 evita gerar links duplicados quando alguém clica no botão de novo por não
ter achado o link anterior.

### Geração do token

```vb
Dim bytes(31) As Byte
Using gerador As New System.Security.Cryptography.RNGCryptoServiceProvider()
    gerador.GetBytes(bytes)
End Using
Return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").Replace("=", "")
```

32 bytes = **256 bits** de entropia, em base64url (43 caracteres, seguro para URL). Não
é derivado do id da marca, então não dá para adivinhar nem enumerar.

### Expiração

O INSERT preenche `dtExpiracao_FORMULARIO_MARCA` com `DATEADD(DAY, 30, GETDATE())`.
O Cartman já tratava a coluna — devolve `410 EXPIRED` — mas antes o ERP não a
preenchia, e o link vivia para sempre até ser usado. Um link vazado num grupo de
WhatsApp continuava válido meses depois.

### Padrões seguidos

- `SqlCommand.Parameters` com `SqlDbType` em tudo — zero concatenação
- `WITH (NOLOCK)` nos SELECT
- `Using` em conexões e comandos
- SELECT: `Salva_log_erro` e retorna valor padrão · INSERT: `Salva_log_erro` e `Throw`
- Funções novas ao final do arquivo
- `id_PS_PESSOA_inc` / `id_PS_PESSOA_alt` recebem `Session("id_PS_PESSOA_USUARIO")`,
  que é `USUARIOS.id_PS_PESSOA` — **não** `id_USUARIOS`. Ver
  [05-banco-de-dados.md](05-banco-de-dados.md).

---

## 3. `detalhes-marca.aspx.designer.vb`

Declaração manual de 6 controles: `areaFormularioMarca`, `ButtonFormularioMarca`,
`areaLinkFormularioMarca`, `TextBoxLinkFormularioMarca`, `areaStatusFormularioMarca` e
`labelStatusFormularioMarca`.

Manual porque o `.aspx` foi editado fora do Visual Studio — a IDE só regenera o
designer quando a edição acontece nela.

---

## 4. `Web.config` — fora do controle de versão

```xml
<add key="BaseURLFormularioMarca" value="https://formulario.nogle.tech/" />
```

O arquivo é **gitignored** (`conteltelecom/.gitignore:1`), então não aparece em nenhum
diff e **precisa ser aplicado à mão em cada ambiente**.

A URL final é `BaseURLFormularioMarca & token`, então o valor **precisa terminar com
barra**. Sem a barra o link sai quebrado e o cliente vê "link inválido".

---

## Build

`detalhes-marca.aspx.vb` é `CodeBehind`, ou seja, compila para a DLL do projeto.
Depois de alterar o code-behind ou o designer é **obrigatório** compilar pelo Visual
Studio ou MSBuild antes de testar. Sem isso o ASP.NET continua servindo a DLL antiga e
o sintoma típico é `'X' is not a member of 'Y'` mesmo com o código correto na tela.

## Encoding

Os três arquivos são UTF-8 **com BOM** (`EF BB BF`) e CRLF. Manter: sem BOM o ASP.NET
falha ao interpretar acentos e ao carregar o tipo da classe. Ao editar fora do Visual
Studio, conferir com `xxd` que os 3 primeiros bytes continuam `efbbbf`.

## Pendências

- Não existe botão de **revogar** link (`st_FORMULARIO_MARCA = 0`). A coluna existe e o
  Cartman a respeita; falta a ação na tela.
- `Request.QueryString("id")` é convertido para `Integer` por atribuição implícita,
  seguindo o padrão que a tela já usava. Um id não numérico gera exceção na página.
