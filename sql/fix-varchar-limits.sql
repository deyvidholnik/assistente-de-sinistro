-- Ajustar limites de VARCHAR que estão muito pequenos

-- Aumentar limite do tipo_atendimento
ALTER TABLE sinistros ALTER COLUMN tipo_atendimento TYPE VARCHAR(50);

-- Aumentar limite do tipo_assistencia
ALTER TABLE sinistros ALTER COLUMN tipo_assistencia TYPE VARCHAR(50);

-- Verificar e ajustar outros campos se necessário
ALTER TABLE sinistros ALTER COLUMN status TYPE VARCHAR(50);

-- Remover constraint antigo e recriar com novos valores
ALTER TABLE sinistros DROP CONSTRAINT IF EXISTS sinistros_tipo_atendimento_check;
ALTER TABLE sinistros ADD CONSTRAINT sinistros_tipo_atendimento_check 
CHECK (tipo_atendimento IN ('sinistro', 'assistencia'));

-- Atualizar constraint do status também
ALTER TABLE sinistros DROP CONSTRAINT IF EXISTS sinistros_status_check;
ALTER TABLE sinistros ADD CONSTRAINT sinistros_status_check 
CHECK (status IN ('pendente', 'aguardando_documentos', 'em_analise', 'aprovado', 'rejeitado', 'concluido'));