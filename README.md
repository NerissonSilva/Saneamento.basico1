# Projeto Full Stack com Login Social

Backend (Node.js + Express) e Frontend (HTML/CSS/JS) com autenticação Google OAuth.

## 🚀 Uma Única URL Pública

Frontend e backend servidos juntos em **uma única URL** no Render!

## Deploy Rápido no Render

### Método 1: Deploy Manual (Mais Simples)

1. **Criar PostgreSQL:**
   - [Render Dashboard](https://dashboard.render.com/) > New > PostgreSQL
   - Name: `sessions-db`, Plan: Free

2. **Criar Web Service:**
   - New > Web Service > Conectar repositório
   - Build: `cd backend && npm install`
   - Start: `cd backend && npm start`
   - Plan: Free

3. **Configurar variáveis** (veja DEPLOY.md)

### Método 2: Blueprint (Automático)

1. Push para GitHub
2. Render Dashboard > New > Blueprint
3. Conectar repositório (detecta `render.yaml`)

**Se der erro "No resources managed by YAML":** Use o Método 1 (Manual)

### Configurar Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/)
2. Criar projeto > APIs & Services > Credentials
3. OAuth 2.0 Client ID
4. Redirect URI: `https://seu-app.onrender.com/api/auth/google/callback`

## 🛠️ Desenvolvimento Local

```bash
cd backend
npm install
# Configure as variáveis no .env
npm run dev
```

Acesse: `http://localhost:3000`

## 📦 Estrutura

```
├── backend/          # API Node.js (serve o frontend também)
│   ├── server.js     # Servidor Express
│   ├── package.json
│   └── .env
├── frontend/         # Site estático (servido pelo backend)
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── render.yaml       # Configuração Render (1 serviço apenas)
```

## 🌐 Rotas

- `/` - Frontend (index.html)
- `/api` - API info
- `/api/health` - Health check
- `/api/auth/google` - Login Google
- `/api/auth/user` - Dados do usuário
- `/api/auth/logout` - Logout

## ✅ Compatibilidade

- ✅ Linux (Ubuntu, Debian, etc)
- ✅ Render.com
- ✅ Node.js 18+
- ✅ Deploy sem falhas
