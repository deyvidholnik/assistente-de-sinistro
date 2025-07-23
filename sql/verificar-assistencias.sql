-- VERIFICAR SE EXISTEM ASSISTÊNCIAS ADICIONAIS NO BANCO
-- Execute este SQL no Supabase para verificar os dados

-- 1. Verificar se os campos existem na tabela sinistros
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sinistros' 
AND column_name IN ('assistencia_adicional', 'total_assistencias', 'assistencias_tipos')
ORDER BY column_name;

-- 2. Verificar quantos registros têm assistência adicional
SELECT 
    COUNT(*) as total_sinistros,
    COUNT(*) FILTER (WHERE assistencia_adicional = true) as com_assistencia_adicional,
    COUNT(*) FILTER (WHERE assistencias_tipos IS NOT NULL) as com_tipos_assistencia
FROM sinistros;

-- 3. Mostrar exemplos de registros com assistência adicional
SELECT 
    numero_sinistro,
    tipo_atendimento,
    tipo_assistencia,
    assistencia_adicional,
    total_assistencias,
    assistencias_tipos,
    data_criacao
FROM sinistros 
WHERE assistencia_adicional = true 
OR assistencias_tipos IS NOT NULL
ORDER BY data_criacao DESC
LIMIT 10;

-- 4. Testar a view atualizada
SELECT 
    numero_sinistro,
    tipo_atendimento,
    tipo_assistencia,
    assistencia_adicional,
    total_assistencias,
    assistencias_tipos,
    cnh_proprio_nome
FROM view_sinistros_completos 
WHERE assistencia_adicional = true 
OR assistencias_tipos IS NOT NULL
ORDER BY data_criacao DESC
LIMIT 5;

-- 5. Criar um registro de teste (OPCIONAL - descomente se quiser testar)
/*
INSERT INTO sinistros (
    tipo_atendimento,
    tipo_assistencia, 
    assistencia_adicional,
    total_assistencias,
    assistencias_tipos,
    status,
    documentos_furtados,
    outros_veiculos_envolvidos
) VALUES (
    'assistencia',
    'guincho',
    true,
    2,
    ARRAY['hotel', 'taxi'],
    'pendente',
    false,
    false
);
*/ 