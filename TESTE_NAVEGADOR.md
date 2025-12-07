# 🌐 Guia de Teste no Navegador

## ✅ Servidor Funcionando

O servidor está rodando corretamente em: **http://localhost:3000**

## 📋 Rotas Disponíveis

### Frontend (Interface do Usuário)
- **`http://localhost:3000/`** - Página principal com login

### API (Backend)
- **`http://localhost:3000/api`** - Informações da API
- **`http://localhost:3000/api/health`** - Status do servidor
- **`http://localhost:3000/api/auth/google`** - Login com Google
- **`http://localhost:3000/api/auth/user`** - Dados do usuário logado
- **`http://localhost:3000/api/auth/logout`** - Logout (POST)

## 🧪 Como Testar

### 1. Iniciar o Servidor

```bash
cd backend
npm start
```

Você verá:
```
✅ Found frontend at: C:\Users\neris\Desktop\Projeto\frontend
📄 index.html exists: true
✅ All systems ready!
```

### 2. Abrir no Navegador

Acesse: **http://localhost:3000**

Você deve ver:
- Título: "Bem-vindo"
- Subtítulo: "Faça login para continuar"
- Botão: "Continuar com Google"

### 3. Testar API

Abra em outra aba: **http://localhost:3000/api/health**

Você deve ver:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-07T...",
  "frontend": "C:\\Users\\neris\\Desktop\\Projeto\\frontend"
}
```

### 4. Testar Login (Requer Google OAuth configurado)

1. Clique em "Continuar com Google"
2. Será redirecionado para o Google
3. Após autorizar, volta para a aplicação
4. Deve mostrar seu nome, email e foto

**Nota:** Para funcionar, você precisa:
- Configurar Google OAuth no Google Cloud Console
- Adicionar as credenciais no arquivo `.env`

## 🔧 Configuração do Google OAuth (Local)

### 1. Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um projeto
3. Vá em **APIs & Services** > **Credentials**
4. Crie **OAuth 2.0 Client ID**
5. Configure:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`

### 2. Arquivo .env

Edite `backend/.env`:

```env
GOOGLE_CLIENT_ID=seu-client-id-aqui
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### 3. Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C)
npm start
```

## 🐛 Troubleshooting

### Erro: "Missing required environment variables"

**Solução:** Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `GOOGLE_CALLBACK_URL` no arquivo `.env`

### Erro: "Cannot GET /"

**Solução:** Verifique se o frontend foi encontrado nos logs:
```
✅ Found frontend at: ...
📄 index.html exists: true
```

### Erro: "CORS"

**Solução:** O CORS já está configurado. Se ainda houver erro, verifique se está acessando `http://localhost:3000` (não `127.0.0.1`)

### Página em branco

**Solução:** 
1. Abra o Console do navegador (F12)
2. Verifique se há erros JavaScript
3. Verifique se os arquivos estão carregando:
   - `app.js`
   - `styles.css`

## 📊 Logs do Servidor

O servidor mostra logs úteis:

```
📄 Serving index.html for: /
✅ User authenticated successfully
✅ User is authenticated: João Silva
✅ User logged out: João Silva
```

## ✅ Checklist de Funcionamento

- [ ] Servidor inicia sem erros
- [ ] Frontend encontrado
- [ ] `http://localhost:3000/` carrega a página
- [ ] `http://localhost:3000/api/health` retorna JSON
- [ ] Botão "Continuar com Google" aparece
- [ ] CSS está aplicado (página com gradiente roxo)
- [ ] Console do navegador sem erros

## 🚀 Próximo Passo: Deploy

Quando tudo funcionar localmente, faça deploy no Render:

```bash
git add .
git commit -m "Fix routes and improve logging"
git push origin main
```

Depois siga o guia em `DEPLOY_FINAL.md`

## 📝 Estrutura de Rotas

```
┌─────────────────────────────────────┐
│         http://localhost:3000       │
└─────────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼────┐              ┌─────▼─────┐
│Frontend│              │    API    │
│  (/)   │              │  (/api)   │
└────────┘              └───────────┘
    │                         │
    ├─ index.html            ├─ /health
    ├─ app.js                ├─ /auth/google
    └─ styles.css            ├─ /auth/user
                             └─ /auth/logout
```

## 🎉 Tudo Funcionando!

Se você conseguiu:
- ✅ Ver a página de login
- ✅ API respondendo
- ✅ Sem erros no console

**Parabéns! Seu projeto está pronto para deploy!** 🚀
