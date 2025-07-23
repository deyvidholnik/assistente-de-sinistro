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

-- Inserir usuário admin padrão (você deve alterar a senha)
-- Note: Você precisa primeiro criar o usuário no auth.users via dashboard do Supabase
-- e depois inserir o registro aqui com o UUID correto

-- Exemplo de como inserir um admin:
-- INSERT INTO public.user_info (username, email, user_level, full_name, uid_auth)
-- VALUES ('admin', 'admin@example.com', 'admin', 'Administrador', 'uuid-do-usuario-auth');

-- Configurar RLS (Row Level Security) se necessário
-- ALTER TABLE public.user_info ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios dados
-- CREATE POLICY "Users can view own user_info" ON public.user_info
--     FOR SELECT USING (auth.uid() = uid_auth);

-- Política para permitir que admins vejam todos os dados
-- CREATE POLICY "Admins can view all user_info" ON public.user_info
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM public.user_info
--             WHERE uid_auth = auth.uid() AND user_level = 'admin'
--         )
--     ); 