# 🚨 URGENTE: Criar Bucket no Supabase Storage

## ❌ Erro Atual
```
{"statusCode":"404","error":"Bucket not found","message":"Bucket not found"}
```

## ✅ Solução: Criar o Bucket 'sinistros'

### 1. Acesse o Supabase Storage
1. Vá para: https://nxzzzkzuupgkqmscvscn.supabase.co
2. Faça login na sua conta
3. Clique em **"Storage"** no menu lateral esquerdo

### 2. Criar o Bucket
1. Clique no botão **"New bucket"** (ou "Criar bucket")
2. **Nome do bucket**: `sinistros` (exatamente assim, sem maiúsculas)
3. ✅ **Marque a opção "Public bucket"** (muito importante!)
4. Clique em **"Create bucket"**

### 3. Configurar Permissões (RLS)
Após criar o bucket, execute este SQL no **SQL Editor**:

```sql
-- COPIE E COLE ESTE CÓDIGO NO SQL EDITOR:

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Acesso total sinistros" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública" ON storage.objects;

-- Criar política para acesso completo ao bucket sinistros
CREATE POLICY "Acesso total ao bucket sinistros" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'sinistros') 
WITH CHECK (bucket_id = 'sinistros');

-- Política para leitura pública
CREATE POLICY "Leitura pública bucket sinistros" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'sinistros');
```

### 4. Verificar se Funcionou
1. Acesse: http://localhost:3001/
2. Preencha um sinistro com fotos
3. Vá para o painel gerente: http://localhost:3001/gerente
4. Clique em "Ver Detalhes" de um sinistro
5. Vá na aba "Arquivos"
6. Clique no botão de download de uma foto
7. A foto deve abrir corretamente

### 5. Verificar no Storage
1. Volte para **Storage** > **sinistros**
2. Você deve ver pastas com IDs dos sinistros
3. Dentro de cada pasta, os arquivos salvos
4. Clique em um arquivo para ver se abre

## 🔧 Se Ainda Não Funcionar

### Opção 1: Recriar o Bucket
1. Delete o bucket `sinistros` se existir
2. Crie novamente marcando **"Public bucket"**
3. Execute novamente o SQL de permissões

### Opção 2: Desabilitar RLS Temporariamente
Execute no SQL Editor:
```sql
-- APENAS SE OUTRAS OPÇÕES FALHAREM:
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

### Opção 3: Verificar Configuração
1. Vá para **Settings** > **Storage**
2. Verifique se há configurações de CORS
3. Certifique-se que o bucket está marcado como público

## 🎯 Resultado Esperado

Após criar o bucket corretamente:
- ✅ Fotos salvam no Storage
- ✅ URLs das fotos funcionam
- ✅ Arquivos aparecem na aba "Arquivos"
- ✅ Downloads funcionam
- ✅ Sem erros 404

## 📋 Checklist

- [ ] Bucket 'sinistros' criado
- [ ] Opção "Public bucket" marcada
- [ ] SQL de permissões executado
- [ ] Teste de upload realizado
- [ ] URLs das fotos funcionando
- [ ] Downloads funcionando

## 🚨 Importante

- **Nome do bucket**: deve ser exatamente `sinistros` (minúsculas)
- **Public bucket**: deve estar marcado
- **Permissões**: execute o SQL de RLS
- **Teste**: sempre teste após criar

---

**Execute essas instruções AGORA para resolver o problema!** 