# 🚀 Guia de Deploy no Render - Uma Única URL

## Passo 1: Configurar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure:
   - Application type: **Web application**
   - Authorized redirect URIs: `https://SEU-APP.onrender.com/api/auth/google/callback`
6. Copie o **Client ID** e **Client Secret**

## Passo 2: Deploy no Render

### Opção A: Deploy Manual (Recomendado - Mais Confiável)

1. Acesse [Render Dashboard](https://dashboard.render.com/)

2. **Crie o banco de dados primeiro:**
   - Clique em **New** > **PostgreSQL**
   - Name: `sessions-db`
   - Database: `sessions`
   - Plan: **Free**
   - Clique em **Create Database**
   - Aguarde a criação (2-3 minutos)

3. **Crie o web service:**
   - Clique em **New** > **Web Service**
   - Conecte seu repositório GitHub
   - Configure:
     - Name: `fullstack-app`
     - Runtime: **Node**
     - Build Command: `cd backend && npm install`
     - Start Command: `cd backend && npm start`
     - Plan: **Free**

4. **Configure as variáveis de ambiente** (veja Passo 3 abaixo)

5. Clique em **Create Web Service**

### Opção B: Deploy com Blueprint

1. Faça push do código para GitHub
2. Acesse [Render Dashboard](https://dashboard.render.com/)
3. Clique em **New** > **Blueprint**
4. Conecte seu repositório
5. O Render detectará o `render.yaml` ou `.render.yaml`
6. Aguarde o deploy (5-10 minutos)

**Nota:** Se o Blueprint não funcionar, use a Opção A (Manual).

## Passo 3: Configurar Variáveis de Ambiente

No dashboard do seu serviço no Render, adicione:

```
NODE_ENV=production
SESSION_SECRET=(clique em Generate para criar automaticamente)
GOOGLE_CLIENT_ID=seu-client-id-aqui
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
GOOGLE_CALLBACK_URL=https://SEU-APP.onrender.com/api/auth/google/callback
DATABASE_URL=(será preenchido automaticamente se usar Blueprint)
```

**IMPORTANTE:** Não precisa configurar `FRONTEND_URL` - tudo está na mesma URL agora!

## Passo 4: Atualizar Google OAuth

Volte ao Google Cloud Console e adicione a URL real:
- Authorized redirect URIs: `https://SEU-APP.onrender.com/api/auth/google/callback`

## ✅ Verificação

Acesse sua aplicação em uma única URL:
- **Frontend:** `https://SEU-APP.onrender.com`
- **API Health:** `https://SEU-APP.onrender.com/api/health`
- **API Info:** `https://SEU-APP.onrender.com/api`

## 🐛 Troubleshooting

### Erro: "OAuth2Strategy requires a clientID option"
**Solução:** Configure as variáveis `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `GOOGLE_CALLBACK_URL` no dashboard do Render.

### Erro: "MemoryStore warning"
**Solução:** Certifique-se de que o banco PostgreSQL está conectado e a variável `DATABASE_URL` está configurada.

### Erro: "CORS"
**Solução:** Verifique se `FRONTEND_URL` está configurada corretamente no backend.

## 📝 Notas Importantes

- O plano Free do Render hiberna após 15 minutos de inatividade
- O primeiro acesso após hibernação pode levar 30-60 segundos
- Para produção real, considere upgrade para plano pago
- Mantenha suas credenciais seguras e nunca faça commit do arquivo `.env`
