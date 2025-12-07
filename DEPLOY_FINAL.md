# 🚀 Guia Final de Deploy - Render

## ✅ Status Atual

- ✅ Estrutura do projeto corrigida
- ✅ Frontend em diretório separado (`frontend/`)
- ✅ Backend configurado (`backend/`)
- ✅ Detecção automática de caminho implementada
- ✅ Commit inicial feito
- ✅ Pronto para deploy!

## 📁 Estrutura Final

```
Projeto/
├── backend/
│   ├── .env (não commitado)
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── render.yaml
└── README.md
```

## 🔧 Passo a Passo para Deploy

### 1. Criar Repositório no GitHub

```bash
# Se ainda não criou o repositório remoto
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git branch -M main
git push -u origin main
```

### 2. Configurar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto
3. Vá em **APIs & Services** > **Credentials**
4. Crie **OAuth 2.0 Client ID**
5. Adicione redirect URI (temporário): `http://localhost:3000/api/auth/google/callback`
6. Copie **Client ID** e **Client Secret**

### 3. Deploy no Render

#### Opção A: Blueprint (Automático)

1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Clique em **New** > **Blueprint**
3. Conecte seu repositório GitHub
4. O Render detectará `render.yaml`
5. Clique em **Apply**

#### Opção B: Manual

1. **Criar PostgreSQL:**
   - New > PostgreSQL
   - Name: `sessions-db`
   - Plan: Free
   - Create Database

2. **Criar Web Service:**
   - New > Web Service
   - Conectar repositório
   - Name: `fullstack-app`
   - Runtime: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: Free

### 4. Configurar Variáveis de Ambiente

No dashboard do serviço no Render, adicione:

```
NODE_ENV=production
SESSION_SECRET=(clique em Generate)
GOOGLE_CLIENT_ID=seu-client-id-do-google
GOOGLE_CLIENT_SECRET=seu-client-secret-do-google
GOOGLE_CALLBACK_URL=https://SEU-APP.onrender.com/api/auth/google/callback
```

Se usar Blueprint, o `DATABASE_URL` será configurado automaticamente.
Se manual, conecte o banco PostgreSQL ao serviço.

### 5. Atualizar Google OAuth

Após o deploy, volte ao Google Cloud Console e atualize:

**Authorized redirect URIs:**
- Adicione: `https://SEU-APP.onrender.com/api/auth/google/callback`
- Remova: `http://localhost:3000/api/auth/google/callback` (se não for mais usar local)

### 6. Verificar Deploy

Acesse os endpoints:

- **Frontend:** `https://SEU-APP.onrender.com/`
- **API Health:** `https://SEU-APP.onrender.com/api/health`
- **API Info:** `https://SEU-APP.onrender.com/api`

Nos logs do Render, você deve ver:

```
✅ Found frontend at: /opt/render/project/src/frontend
📄 index.html exists: true
✅ All systems ready!
```

## 🐛 Se der erro "Frontend not found"

Os logs mostrarão todos os caminhos tentados e o conteúdo do diretório. Isso ajudará a diagnosticar o problema.

Verifique:
1. ✅ Todos os arquivos foram commitados? `git status`
2. ✅ O push foi feito? `git log`
3. ✅ O Render fez pull do código mais recente?

## 📝 Comandos Úteis

```bash
# Ver status do git
git status

# Ver commits
git log --oneline

# Fazer novo commit
git add .
git commit -m "Sua mensagem"
git push

# Testar localmente
cd backend
npm start
# Acesse: http://localhost:3000
```

## 🎉 Pronto!

Seu app full stack com login social está pronto para deploy no Render!

**Uma única URL serve:**
- Frontend (HTML/CSS/JS)
- Backend (API Node.js)
- Autenticação Google OAuth
- Sessões persistentes (PostgreSQL)
