# 🚀 Guia de Deploy - PV Auto Proteção

## 📦 Problema Resolvido: Múltiplos Gerenciadores de Pacote

### ❌ **Problema Anterior:**
O projeto tinha **3 gerenciadores de pacote** conflitantes:
- `package-lock.json` (npm)
- `yarn.lock` (yarn) 
- `pnpm-lock.yaml` (pnpm)

### ✅ **Solução Implementada:**
**Padronização para NPM** com configurações específicas:

```bash
# Arquivos removidos
yarn.lock         # ❌ Removido
pnpm-lock.yaml    # ❌ Removido (estava corrompido)

# Arquivos mantidos
package.json      # ✅ Mantido
package-lock.json # ✅ Regenerado
.npmrc           # ✅ Criado
```

## ⚙️ Configuração de Deploy

### 1. **Arquivo `.npmrc`**
```ini
legacy-peer-deps=true
save-exact=false
```

### 2. **Scripts de Deploy**
```json
{
  "scripts": {
    "build:prod": "npm install --legacy-peer-deps && next build",
    "clean": "rm -rf .next node_modules package-lock.json",
    "reinstall": "npm run clean && npm install --legacy-peer-deps"
  }
}
```

### 3. **Comandos para Deploy**

#### 🐳 **Docker/Vercel/Netlify:**
```dockerfile
# No Dockerfile, use:
RUN npm install --legacy-peer-deps
RUN npm run build
```

#### ☁️ **Plataformas de Deploy:**
```bash
# Build command:
npm run build:prod

# Start command:
npm start
```

#### 🔧 **Local:**
```bash
# Desenvolvimento
npm run dev

# Build local
npm run build

# Limpeza completa
npm run reinstall
```

## 🚨 Conflitos de Dependências Resolvidos

### **Problema:** React 19 vs Bibliotecas Antigas
```
ERROR: vaul@0.9.6 requires React ^16.8 || ^17.0 || ^18.0
FOUND: react@19.1.0
```

### **Solução:** Legacy Peer Dependencies
```bash
npm install --legacy-peer-deps
```

## 📋 Checklist de Deploy

- [x] ✅ Remover `yarn.lock` e `pnpm-lock.yaml`
- [x] ✅ Criar arquivo `.npmrc`
- [x] ✅ Adicionar scripts de deploy
- [x] ✅ Resolver conflitos de dependências
- [x] ✅ Testar build local
- [x] ✅ Documentar processo

## 🎯 Comandos Essenciais

```bash
# ⚡ Deploy rápido
npm run build:prod

# 🔄 Reinstalação completa
npm run reinstall

# 🧪 Teste local
npm run dev

# 🏗️ Build para produção
npm run build
```

## 🌐 Configuração de Plataformas

### **Vercel**
```json
{
  "buildCommand": "npm run build:prod",
  "installCommand": "npm install --legacy-peer-deps"
}
```

### **Netlify**
```toml
[build]
  command = "npm run build:prod"
  publish = ".next"

[build.environment]
  NPM_FLAGS = "--legacy-peer-deps"
```

### **Railway/Render**
```yaml
build:
  commands:
    - npm install --legacy-peer-deps
    - npm run build
```

## 🚀 Status

✅ **Projeto pronto para deploy!**
- ✅ Gerenciador único (npm)
- ✅ Dependências resolvidas  
- ✅ Build funcionando
- ✅ Configuração otimizada

---

**💡 Dica:** Use sempre `npm install --legacy-peer-deps` para este projeto devido aos conflitos React 19 vs bibliotecas antigas. 