-- Adicionar tipo 'documento_adicional' à tabela arquivos_sinistro
-- Script para permitir uploads de documentos adicionais

-- Remover constraint existente
ALTER TABLE arquivos_sinistro DROP CONSTRAINT IF EXISTS arquivos_sinistro_tipo_arquivo_check;

-- Adicionar nova constraint com 'documento_adicional'
ALTER TABLE arquivos_sinistro ADD CONSTRAINT arquivos_sinistro_tipo_arquivo_check 
CHECK (tipo_arquivo IN (
    'cnh_proprio', 
    'cnh_terceiro', 
    'crlv_proprio', 
    'crlv_terceiro', 
    'boletim_ocorrencia', 
    'foto_veiculo',
    'documento_adicional'
));

-- Verificar a constraint
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'arquivos_sinistro'::regclass 
AND conname = 'arquivos_sinistro_tipo_arquivo_check';