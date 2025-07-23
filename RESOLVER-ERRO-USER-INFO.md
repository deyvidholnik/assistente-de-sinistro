# 🔧 RESOLVER ERRO: Usuário não encontrado na user_info

## 🚨 Problema Identificado
A tabela `user_info` **EXISTE**, mas não há nenhum registro para o seu usuário.

**UUID do seu usuário:** `bba63e27-5ad2-4173-91f8-152c033fe3a3`
**Email:** `deynik@hotmail.com`

## ✅ Solução Imediata

### 1. **Acesse o Supabase Dashboard**
- https://supabase.com/dashboard
- Vá para **SQL Editor**

### 2. **Execute este comando SQL:**
```sql
INSERT INTO public.user_info (username, email, user_level, full_name, uid_auth)
VALUES ('admin', 'deynik@hotmail.com', 'admin', 'Administrador', 'bba63e27-5ad2-4173-91f8-152c033fe3a3');
```

### 3. **Verificar se funcionou:**
```sql
SELECT * FROM public.user_info WHERE uid_auth = 'bba63e27-5ad2-4173-91f8-152c033fe3a3';
```

## 🧪 **Testar o Sistema**
1. Recarregue a página `/admin/login`
2. Use suas credenciais: `deynik@hotmail.com`
3. Deve redirecionar para `/admin/dashboard`

---

## 📋 **Por que aconteceu?**

O sistema funciona assim:
1. **Supabase Auth** autentica com email/senha
2. **Sistema busca** o usuário na tabela `user_info` pelo UUID
3. **Se não encontrar** = erro 406

Você estava autenticado no Supabase, mas não tinha registro na `user_info`.

## 🔄 **Melhorias implementadas**

✅ **Console mostra comandos** SQL prontos para copiar  
✅ **Diferencia erros** entre "tabela não existe" e "usuário não encontrado"  
✅ **UUID e email** são mostrados automaticamente no console  

## 🎯 **Para outros usuários**

### **Manager:**
```sql
INSERT INTO public.user_info (username, email, user_level, full_name, uid_auth)
VALUES ('gerente1', 'gerente@exemplo.com', 'manager', 'Nome do Gerente', 'UUID_DO_USUARIO');
```

### **Consultar UUIDs:**
```sql
SELECT id, email FROM auth.users;
```

---

## ⚡ **Status após correção:**
- ✅ **Admin:** `deynik@hotmail.com` → `/admin/dashboard`
- ✅ **Manager:** (quando criado) → `/gerente`
- ❌ **Outros:** Acesso negado

O sistema agora está configurado e pronto para uso! 🚀 