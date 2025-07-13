-- Adicionar novos campos para tipo de atendimento e assistência
-- E atualizar constraint de tipo_sinistro para incluir pequenos_reparos

-- 1. Adicionar campo tipo_atendimento
ALTER TABLE sinistros 
ADD COLUMN IF NOT EXISTS tipo_atendimento VARCHAR(20) DEFAULT 'sinistro' 
CHECK (tipo_atendimento IN ('sinistro', 'assistencia'));

-- 2. Adicionar campo tipo_assistencia
ALTER TABLE sinistros 
ADD COLUMN IF NOT EXISTS tipo_assistencia VARCHAR(20) 
CHECK (tipo_assistencia IN ('hotel', 'guincho', 'taxi', 'pane_seca', 'pane_mecanica', 'pane_eletrica', 'trocar_pneu'));

-- 3. Remover constraint antigo de tipo_sinistro
ALTER TABLE sinistros DROP CONSTRAINT IF EXISTS sinistros_tipo_sinistro_check;

-- 4. Tornar tipo_sinistro nullable
ALTER TABLE sinistros ALTER COLUMN tipo_sinistro DROP NOT NULL;

-- 5. Adicionar nova constraint incluindo pequenos_reparos
ALTER TABLE sinistros 
ADD CONSTRAINT sinistros_tipo_sinistro_check 
CHECK (tipo_sinistro IN ('colisao', 'furto', 'roubo', 'pequenos_reparos'));

-- 6. Comentário sobre os novos campos
COMMENT ON COLUMN sinistros.tipo_atendimento IS 'Tipo de atendimento: sinistro ou assistencia';
COMMENT ON COLUMN sinistros.tipo_assistencia IS 'Tipo de assistência quando tipo_atendimento = assistencia';

-- 7. Criar índice para os novos campos
CREATE INDEX IF NOT EXISTS idx_sinistros_tipo_atendimento ON sinistros(tipo_atendimento);
CREATE INDEX IF NOT EXISTS idx_sinistros_tipo_assistencia ON sinistros(tipo_assistencia); 