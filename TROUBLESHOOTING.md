# 🔧 Troubleshooting - Render Deploy

## Erro: "ENOENT: no such file or directory, stat '/opt/render/project/frontend/index.html'"

### Causa
O Render não está encontrando os arquivos do frontend.

### Soluções

#### Solução 1: Verificar estrutura do repositório

Certifique-se de que seu repositório tem esta estrutura:
```
projeto/
├── backend/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── styles.css
└── render.yaml
```

#### Solução 2: Verificar logs do build

No Render Dashboard:
1. Vá em seu serviço
2. Clique em "Logs"
3. Procure por "Checking directory structure..."
4. Verifique se os arquivos do frontend aparecem

#### Solução 3: Atualizar Build Command

Se os logs mostrarem que o frontend não existe, atualize o `render.yaml`:

```yaml
buildCommand: |
  ls -la
  cd backend && npm install
```

#### Solução 4: Deploy Manual (Alternativa)

Se o problema persistir, use esta configuração manual no Render:

**Build Command:**
```bash
cd backend && npm install
```

**Start Command:**
```bash
cd backend && npm start
```

**Root Directory:** (deixe em branco ou use `/`)

## Erro: "OAuth2Strategy requires a clientID option"

### Causa
Variáveis de ambiente do Google OAuth não configuradas.

### Solução
No Render Dashboard, adicione:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`

## Erro: "MemoryStore warning"

### Causa
PostgreSQL não conectado.

### Solução
1. Verifique se o banco `sessions-db` foi criado
2. Verifique se `DATABASE_URL` está configurada
3. Conecte o banco ao serviço no Render

## Erro: "Port already in use"

### Causa
Porta 3000 já está em uso localmente.

### Solução
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## Verificar se tudo está funcionando

### Local
```bash
cd backend
npm run verify
npm start
```

Acesse: http://localhost:3000

### Render
Acesse os endpoints:
- `https://seu-app.onrender.com/` (Frontend)
- `https://seu-app.onrender.com/api/health` (API)

## Logs úteis

O servidor mostra logs importantes:
```
✅ Server running on port 3000
📁 __dirname: /opt/render/project/src/backend
📁 Frontend path: /opt/render/project/src/frontend
📄 index.html exists: true
```

Se `index.html exists: false`, o problema é na estrutura do repositório.

## Contato

Se nenhuma solução funcionar:
1. Verifique os logs completos no Render
2. Confirme que todos os arquivos foram commitados no Git
3. Tente fazer um novo deploy
