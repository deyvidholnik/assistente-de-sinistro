-- Solução simples: apenas adicionar campo para andamento na tabela existente
ALTER TABLE sinistros ADD COLUMN IF NOT EXISTS andamento JSONB DEFAULT NULL;

-- Criar índice para performance em consultas JSON
CREATE INDEX IF NOT EXISTS idx_sinistros_andamento ON sinistros USING GIN (andamento);

-- Verificar se foi aplicado
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sinistros' AND column_name = 'andamento'; 