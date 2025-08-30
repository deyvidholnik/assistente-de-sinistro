-- Script para atualizar o constraint de user_level para incluir 'funcionario' ao invés de 'user'
-- Este script precisa ser executado no banco de dados Supabase

-- 1. Primeiro, verificar se existem usuários com level 'user' que precisam ser migrados
SELECT username, email, user_level FROM public.user_info WHERE user_level = 'user';

-- 2. Migrar usuários existentes com level 'user' para 'funcionario' (se existirem)
UPDATE public.user_info 
SET user_level = 'funcionario' 
WHERE user_level = 'user';

-- 3. Remover o constraint antigo
ALTER TABLE public.user_info 
DROP CONSTRAINT user_info_user_level_check;

-- 4. Adicionar o novo constraint com 'funcionario' ao invés de 'user'
ALTER TABLE public.user_info 
ADD CONSTRAINT user_info_user_level_check 
CHECK (
  user_level = ANY (
    ARRAY['admin'::text, 'manager'::text, 'funcionario'::text]
  )
);

-- 5. Verificar se o constraint foi aplicado corretamente
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'user_info_user_level_check';