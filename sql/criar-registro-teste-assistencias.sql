-- CRIAR REGISTRO DE TESTE COM ASSISTÊNCIAS ADICIONAIS
-- Execute este SQL no Supabase para testar a funcionalidade

-- 1. Criar um sinistro de teste com assistência adicional
INSERT INTO sinistros (
    tipo_atendimento,
    tipo_assistencia, 
    assistencia_adicional,
    total_assistencias,
    assistencias_tipos,
    status,
    documentos_furtados,
    outros_veiculos_envolvidos,
    data_criacao,
    data_atualizacao
) VALUES (
    'assistencia',
    'guincho',
    true,
    2,
    ARRAY['hotel', 'taxi'],
    'pendente',
    false,
    false,
    NOW(),
    NOW()
);

-- 2. Pegar o ID do sinistro recém criado e adicionar dados CNH
WITH ultimo_sinistro AS (
    SELECT id FROM sinistros ORDER BY data_criacao DESC LIMIT 1
)
INSERT INTO dados_cnh (
    sinistro_id,
    tipo_titular,
    nome,
    cpf
) 
SELECT 
    id,
    'proprio',
    'João Silva Teste',
    '12345678901'
FROM ultimo_sinistro;

-- 3. Verificar se o registro foi criado corretamente
SELECT 
    numero_sinistro,
    tipo_atendimento,
    tipo_assistencia,
    assistencia_adicional,
    total_assistencias,
    assistencias_tipos,
    status,
    data_criacao
FROM sinistros 
WHERE assistencia_adicional = true
ORDER BY data_criacao DESC
LIMIT 3;

-- 4. Verificar na view
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
ORDER BY data_criacao DESC
LIMIT 3;

-- 5. Criar um segundo registro de teste (colisão com assistências adicionais)
INSERT INTO sinistros (
    tipo_atendimento,
    tipo_sinistro,
    assistencia_adicional,
    total_assistencias,
    assistencias_tipos,
    status,
    documentos_furtados,
    outros_veiculos_envolvidos,
    data_criacao,
    data_atualizacao
) VALUES (
    'sinistro',
    'colisao',
    true,
    3,
    ARRAY['guincho', 'hotel', 'taxi'],
    'pendente',
    false,
    false,
    NOW(),
    NOW()
);

-- 6. Adicionar dados CNH para o segundo registro
WITH ultimo_sinistro AS (
    SELECT id FROM sinistros ORDER BY data_criacao DESC LIMIT 1
)
INSERT INTO dados_cnh (
    sinistro_id,
    tipo_titular,
    nome,
    cpf
) 
SELECT 
    id,
    'proprio',
    'Maria Santos Teste',
    '98765432100'
FROM ultimo_sinistro;

-- 7. Verificação final
SELECT 
    numero_sinistro,
    tipo_atendimento,
    tipo_sinistro,
    tipo_assistencia,
    assistencia_adicional,
    total_assistencias,
    assistencias_tipos,
    cnh_proprio_nome,
    status
FROM view_sinistros_completos 
WHERE assistencia_adicional = true
ORDER BY data_criacao DESC;

-- 8. Contar total de registros com assistências adicionais
SELECT 
    COUNT(*) as total_com_assistencias_adicionais
FROM sinistros 
WHERE assistencia_adicional = true; 