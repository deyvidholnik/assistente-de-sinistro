-- Adicionar novos tipos de arquivo para vídeos
-- Data: 2025-01-10

-- Primeiro, remover a constraint existente
ALTER TABLE arquivos_sinistro DROP CONSTRAINT IF EXISTS arquivos_sinistro_tipo_arquivo_check;

-- Adicionar nova constraint com tipos de vídeo
ALTER TABLE arquivos_sinistro ADD CONSTRAINT arquivos_sinistro_tipo_arquivo_check 
CHECK (tipo_arquivo IN (
    'cnh_proprio', 
    'cnh_terceiro', 
    'crlv_proprio', 
    'crlv_terceiro', 
    'boletim_ocorrencia', 
    'foto_veiculo',
    'documento_adicional',
    'video_proprio',      -- Novo tipo para vídeo do veículo próprio
    'video_terceiro'      -- Novo tipo para vídeo do veículo terceiro
));

-- Verificar se a constraint foi aplicada corretamente
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'arquivos_sinistro'::regclass 
AND conname = 'arquivos_sinistro_tipo_arquivo_check';