-- FIX ADMIN DASHBOARD - Corrigir campos faltantes na view
-- Execute este SQL no Supabase para corrigir o problema do dashboard admin

-- PROBLEMA IDENTIFICADO:
-- A view view_sinistros_completos não possui os campos:
-- - assistencia_adicional 
-- - total_assistencias
-- - assistencias_tipos

-- SOLUÇÃO:
-- 1. Atualizar a view para incluir esses campos
-- 2. Se esses campos não existirem na tabela sinistros, adicioná-los primeiro

-- Verificar se os campos existem na tabela sinistros
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'sinistros' 
    AND column_name IN ('assistencia_adicional', 'total_assistencias', 'assistencias_tipos')
ORDER BY column_name;

-- Se os campos não existirem, executar:
-- ALTER TABLE sinistros ADD COLUMN assistencia_adicional BOOLEAN DEFAULT false;
-- ALTER TABLE sinistros ADD COLUMN total_assistencias INTEGER DEFAULT 0;
-- ALTER TABLE sinistros ADD COLUMN assistencias_tipos TEXT[];

-- Atualizar a view
DROP VIEW IF EXISTS view_sinistros_completos;

CREATE VIEW view_sinistros_completos AS
SELECT 
    s.id,
    s.numero_sinistro,
    s.tipo_atendimento,
    s.tipo_sinistro,
    s.tipo_assistencia,
    
    -- Campos de assistência adicional (podem ser NULL se não existirem)
    s.assistencia_adicional,
    s.total_assistencias,
    s.assistencias_tipos,
    
    s.status,
    s.data_criacao,
    s.data_atualizacao,
    s.documentos_furtados,
    s.outros_veiculos_envolvidos,
    s.nome_completo_furto,
    s.cpf_furto,
    s.placa_veiculo_furto,
    
    -- Dados CNH próprio
    cnh_p.nome as cnh_proprio_nome,
    cnh_p.cpf as cnh_proprio_cpf,
    cnh_p.rg as cnh_proprio_rg,
    cnh_p.numero_registro as cnh_proprio_numero,
    cnh_p.data_vencimento as cnh_proprio_validade,
    cnh_p.categoria as cnh_proprio_categoria,
    
    -- Dados CRLV próprio
    crlv_p.placa as crlv_proprio_placa,
    crlv_p.marca as crlv_proprio_marca,
    crlv_p.modelo as crlv_proprio_modelo,
    crlv_p.ano_modelo as crlv_proprio_ano,
    crlv_p.cor as crlv_proprio_cor,
    crlv_p.combustivel as crlv_proprio_combustivel,
    crlv_p.renavam as crlv_proprio_renavam,
    crlv_p.chassi as crlv_proprio_chassi,
    crlv_p.proprietario as crlv_proprio_proprietario,
    
    -- Dados CNH terceiro
    cnh_t.nome as cnh_terceiros_nome,
    cnh_t.cpf as cnh_terceiros_cpf,
    cnh_t.rg as cnh_terceiros_rg,
    cnh_t.numero_registro as cnh_terceiros_numero,
    cnh_t.data_vencimento as cnh_terceiros_validade,
    cnh_t.categoria as cnh_terceiros_categoria,
    
    -- Dados CRLV terceiro
    crlv_t.placa as crlv_terceiros_placa,
    crlv_t.marca as crlv_terceiros_marca,
    crlv_t.modelo as crlv_terceiros_modelo,
    crlv_t.ano_modelo as crlv_terceiros_ano,
    crlv_t.cor as crlv_terceiros_cor,
    crlv_t.combustivel as crlv_terceiros_combustivel,
    crlv_t.renavam as crlv_terceiros_renavam,
    crlv_t.chassi as crlv_terceiros_chassi,
    crlv_t.proprietario as crlv_terceiros_proprietario,
    
    -- Contadores
    (SELECT COUNT(*) FROM arquivos_sinistro WHERE sinistro_id = s.id AND tipo_arquivo = 'foto_veiculo') as total_fotos,
    (SELECT COUNT(*) FROM arquivos_sinistro WHERE sinistro_id = s.id) as total_arquivos
    
FROM sinistros s
LEFT JOIN dados_cnh cnh_p ON cnh_p.sinistro_id = s.id AND cnh_p.tipo_titular = 'proprio'
LEFT JOIN dados_cnh cnh_t ON cnh_t.sinistro_id = s.id AND cnh_t.tipo_titular = 'terceiro'
LEFT JOIN dados_crlv crlv_p ON crlv_p.sinistro_id = s.id AND crlv_p.tipo_veiculo = 'proprio'
LEFT JOIN dados_crlv crlv_t ON crlv_t.sinistro_id = s.id AND crlv_t.tipo_veiculo = 'terceiro'
ORDER BY s.data_criacao DESC;

-- Verificar se funcionou
SELECT 
    numero_sinistro,
    tipo_atendimento,
    assistencia_adicional,
    total_assistencias,
    array_length(assistencias_tipos, 1) as count_assistencias_array
FROM view_sinistros_completos 
LIMIT 5;