-- Adicionar 'roubo' à constraint do tipo_sinistro
-- Execute no SQL Editor do Supabase

-- Primeiro, remover a constraint existente
ALTER TABLE sinistros DROP CONSTRAINT IF EXISTS sinistros_tipo_sinistro_check;

-- Adicionar nova constraint com 'roubo' incluído
ALTER TABLE sinistros ADD CONSTRAINT sinistros_tipo_sinistro_check 
    CHECK (tipo_sinistro IN ('colisao', 'furto', 'roubo'));

-- Verificar se foi aplicado corretamente
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'sinistros' 
AND n.nspname = 'public'
AND c.conname = 'sinistros_tipo_sinistro_check'; 