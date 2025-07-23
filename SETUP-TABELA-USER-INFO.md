# ⚠️ ERRO 406 - Configurar Tabela user_info

## Problema
Erro ao fazer login: `406 (Not Acceptable)` - A tabela `user_info` não existe.

## ✅ Solução Rápida

### 1. **Acessar Supabase Dashboard**
- Vá para: https://supabase.com/dashboard
- Selecione seu projeto: `nxzzzkzuupgkqmscvscn`

### 2. **Ir para SQL Editor**
- Menu lateral → **SQL Editor**
- Clique em **+ New Query**

### 3. **Executar Script SQL**
Cole e execute este código:

```sql
-- Criar tabela user_info
CREATE TABLE IF NOT EXISTS public.user_info (
  id BIGSERIAL NOT NULL,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  user_level TEXT NOT NULL DEFAULT 'user'::text,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE NULL,
  is_active BOOLEAN NULL DEFAULT true,
  uid_auth UUID NULL,
  CONSTRAINT user_info_pkey PRIMARY KEY (id),
  CONSTRAINT user_info_email_key UNIQUE (email),
  CONSTRAINT user_info_username_key UNIQUE (username),
  CONSTRAINT user_info_uid_auth_fkey FOREIGN KEY (uid_auth) REFERENCES auth.users (id),
  CONSTRAINT user_info_user_level_check CHECK (
    (
      user_level = ANY (
        ARRAY['admin'::text, 'manager'::text, 'user'::text]
      )
    )
  )
) TABLESPACE pg_default;

-- Criar índices
CREATE INDEX IF NOT EXISTS user_info_username_idx ON public.user_info USING btree (username) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS user_info_email_idx ON public.user_info USING btree (email) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS user_info_user_level_idx ON public.user_info USING btree (user_level) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS user_info_uid_auth_idx ON public.user_info USING btree (uid_auth) TABLESPACE pg_default;

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_user_info_updated_at
    BEFORE UPDATE ON public.user_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 4. **Criar seu primeiro usuário Admin**

#### A) Primeiro, crie no Auth:
- **Authentication** → **Users** → **Add User**
- Email: `deynik@hotmail.com` (ou outro)
- Senha: `suasenha123`
- **Copie o UUID** gerado

#### B) Depois, insira na tabela:
```sql
INSERT INTO public.user_info (username, email, user_level, full_name, uid_auth)
VALUES ('admin', 'deynik@hotmail.com', 'admin', 'Administrador', 'COLE_O_UUID_AQUI');
```

### 5. **Verificar se funcionou**
```sql
SELECT * FROM public.user_info;
```

## 🧪 **Testar o Login**
1. Acesse: `http://localhost:3000/admin/login`
2. Use o email e senha criados
3. Deve redirecionar para `/admin/dashboard`

## ⚡ **Se ainda der erro:**

### Verificar permissões RLS:
```sql
-- Desabilitar RLS temporariamente (apenas para teste)
ALTER TABLE public.user_info DISABLE ROW LEVEL SECURITY;
```

### Verificar se a tabela existe:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_info';
```

## 📝 **UUID do usuário logado:**
O erro mostra: `uid_auth=eq.bba63e27-5ad2-4173-91f8-152c033fe3a3`

Use este UUID ao inserir na tabela:
```sql
INSERT INTO public.user_info (username, email, user_level, full_name, uid_auth)
VALUES ('admin', 'deynik@hotmail.com', 'admin', 'Administrador', 'bba63e27-5ad2-4173-91f8-152c033fe3a3');
``` 