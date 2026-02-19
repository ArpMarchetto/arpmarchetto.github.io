# Glossário DC — Interface Web

Interface de consulta e cadastro para o glossário de tradução DC Comics, alimentada diretamente por uma planilha Google Sheets.

## Arquitetura

A interface opera em dois modos automaticamente detectados:

```
modo online (HTTP/HTTPS)
    ├── Autenticação → Google Identity Services (OAuth 2.0)
    ├── Leitura     → Google Sheets API v4 (Bearer token do utilizador)
    └── Escrita     → Google Apps Script (endpoint POST)

modo offline (file://)
    ├── Autenticação → nenhuma (somente leitura)
    ├── Leitura     → Google Sheets API v4 (API Key — planilha pública)
    └── Escrita     → desabilitada (botão "+ Novo Termo" oculto)
```

Sem Node.js, sem banco de dados, sem servidor próprio. Tudo roda no navegador.

---

## Setup

### Modo online (OAuth 2.0) — leitura + escrita, acesso restrito

#### 1. OAuth Client ID

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto (ou use um existente)
3. Ative a **Google Sheets API**: `APIs & Services > Library > Google Sheets API > Enable`
4. Crie uma credencial: `APIs & Services > Credentials > Create Credentials > OAuth client ID`
5. Tipo: **Web application**
6. Em **Authorized JavaScript origins**, adicione os domínios da app:
   - Produção: `https://SEU_USER.github.io`
   - Local: `http://localhost:8000`
7. Copie o **Client ID** gerado (termina em `.apps.googleusercontent.com`)

#### 2. Google Apps Script (para escrita/cadastro)

1. Acesse [script.google.com](https://script.google.com) e crie um novo projeto
2. Cole o conteúdo do arquivo `apps-script.gs`
3. Substitua `COLE_SEU_SPREADSHEET_ID_AQUI` pelo ID da sua planilha
4. Implante como **App da Web** → executar como **Eu** → acesso: **Qualquer pessoa**
5. Copie a URL de implantação

#### 3. Configurar a interface

Sirva a página via HTTP (ver abaixo), clique em **⚙** e preencha:

| Campo | Valor |
|---|---|
| Spreadsheet ID | ID da planilha (da URL do Google Sheets) |
| OAuth Client ID | Client ID criado no passo 1 |
| Apps Script URL | URL copiada no passo 2 (opcional — só para cadastro) |

---

### Modo offline (file://) — somente leitura, sem login

Abrir `index.html` diretamente no browser (protocolo `file://`) activa o modo offline automaticamente: o login Google é ignorado e a planilha é lida via **API Key**.

#### Requisitos

1. A planilha precisa estar compartilhada como **"Qualquer pessoa com o link pode visualizar"**
2. Criar uma **API Key** no Google Cloud Console:
   - `APIs & Services > Credentials > Create Credentials > API key`
   - Restrinja a chave à **Google Sheets API** (recomendado)

#### Configurar

Abra o arquivo no browser, clique em **⚙** e preencha:

| Campo | Valor |
|---|---|
| Spreadsheet ID | ID da planilha |
| Google API Key | Chave criada acima |

> ⚠️ A API Key fica salva no `localStorage` do seu navegador. Não publique o
> arquivo com a chave já preenchida no código-fonte.

---

## Rodar localmente (modo online)

```bash
# Python (geralmente já instalado no macOS/Linux)
python3 -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

Depois abra **http://localhost:8000** e lembre de ter `http://localhost:8000`
nas *Authorized JavaScript origins* do OAuth Client ID.

---

## Deploy no GitHub Pages

```bash
git init
git add index.html
git commit -m "Glossário DC"
git remote add origin https://github.com/SEU_USER/glossario-dc.git
git push -u origin main

# Nas Settings do repo: Pages > Source > main branch > / (root)
```

O site ficará disponível em `https://SEU_USER.github.io/glossario-dc/`  
Adicione esse domínio às *Authorized JavaScript origins* do OAuth Client ID.

---

## Funcionalidades

- **Dois modos de operação**: online (OAuth, leitura+escrita) e offline/file:// (API Key, somente leitura)
- **Login Google** no modo online — acesso restrito aos membros com permissão na planilha
- **Busca fuzzy** em todas as abas simultaneamente (tolera erros de digitação)
- **Filtro por aba** (era/universo DC)
- **Cadastro de novos termos** via modal — modo online com Apps Script configurado
- **Highlight** dos termos encontrados na busca
- **Responsivo** (funciona em mobile)
- **Atalhos**: `/` para focar na busca, `Esc` para fechar modais
- **Sem backend próprio** — hospedável em qualquer serviço de arquivos estáticos

---

## Notas de segurança

> ⚠️ **CORS no Apps Script:**  
> O Apps Script não responde a preflights CORS (`OPTIONS`). O cliente envia o
> POST sem `Content-Type: application/json` (usa `text/plain` por padrão), o que
> evita o preflight e permite que o Apps Script receba o corpo via
> `e.postData.contents`.
- A escrita passa pelo Apps Script, que roda com as permissões da **sua conta Google**
- Qualquer pessoa com acesso ao site pode cadastrar termos (se o Apps Script estiver configurado)
- Para restringir o cadastro, você pode adicionar autenticação no Apps Script ou simplesmente não configurar a URL do Apps Script (o botão ficará inativo)
