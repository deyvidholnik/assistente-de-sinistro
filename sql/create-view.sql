-- View para consultas completas dos sinistros
CREATE OR REPLACE VIEW view_sinistros_completos AS
SELECT 
    s.id,
    s.numero_sinistro,
    s.tipo_sinistro,
    s.documentos_furtados,
    s.outros_veiculos_envolvidos,
    s.nome_completo_furto,
    s.cpf_furto,
    s.placa_veiculo_furto,
    s.status,
    s.data_criacao,
    s.data_atualizacao,
    
    -- Dados CNH próprio
    cnh_proprio.nome as cnh_proprio_nome,
    cnh_proprio.cpf as cnh_proprio_cpf,
    cnh_proprio.numero_registro as cnh_proprio_numero,
    
    -- Dados CRLV próprio
    crlv_proprio.placa as crlv_proprio_placa,
    crlv_proprio.marca as crlv_proprio_marca,
    crlv_proprio.modelo as crlv_proprio_modelo,
    crlv_proprio.ano_modelo as crlv_proprio_ano,
    
    -- Dados CNH terceiro
    cnh_terceiro.nome as cnh_terceiro_nome,
    cnh_terceiro.cpf as cnh_terceiro_cpf,
    
    -- Dados CRLV terceiro
    crlv_terceiro.placa as crlv_terceiro_placa,
    crlv_terceiro.marca as crlv_terceiro_marca,
    crlv_terceiro.modelo as crlv_terceiro_modelo,
    
    -- Contadores de arquivos
    COALESCE(fotos.total_fotos, 0) as total_fotos,
    COALESCE(arquivos.total_arquivos, 0) as total_arquivos

FROM sinistros s
LEFT JOIN dados_cnh cnh_proprio ON s.id = cnh_proprio.sinistro_id AND cnh_proprio.tipo_titular = 'proprio'
LEFT JOIN dados_cnh cnh_terceiro ON s.id = cnh_terceiro.sinistro_id AND cnh_terceiro.tipo_titular = 'terceiro'
LEFT JOIN dados_crlv crlv_proprio ON s.id = crlv_proprio.sinistro_id AND crlv_proprio.tipo_veiculo = 'proprio'
LEFT JOIN dados_crlv crlv_terceiro ON s.id = crlv_terceiro.sinistro_id AND crlv_terceiro.tipo_veiculo = 'terceiro'
LEFT JOIN (
    SELECT 
        sinistro_id, 
        COUNT(DISTINCT id) as total_fotos
    FROM arquivos_sinistro 
    WHERE tipo_arquivo = 'foto_veiculo'
    GROUP BY sinistro_id
) fotos ON s.id = fotos.sinistro_id
LEFT JOIN (
    SELECT 
        sinistro_id, 
        COUNT(DISTINCT id) as total_arquivos
    FROM arquivos_sinistro 
    GROUP BY sinistro_id
) arquivos ON s.id = arquivos.sinistro_id; 