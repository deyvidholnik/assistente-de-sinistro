-- Adicionar colunas para sistema de criação pelo gerente e tokens de completar ocorrência

-- Adicionar tipo_atendimento se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'tipo_atendimento') THEN
        ALTER TABLE sinistros ADD COLUMN tipo_atendimento VARCHAR(20) CHECK (tipo_atendimento IN ('sinistro', 'assistencia'));
    END IF;
END $$;

-- Adicionar tipo_assistencia se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'tipo_assistencia') THEN
        ALTER TABLE sinistros ADD COLUMN tipo_assistencia VARCHAR(30);
    END IF;
END $$;

-- Adicionar assistencia_adicional se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'assistencia_adicional') THEN
        ALTER TABLE sinistros ADD COLUMN assistencia_adicional BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Adicionar assistencias_tipos se não existir (para múltiplas assistências)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'assistencias_tipos') THEN
        ALTER TABLE sinistros ADD COLUMN assistencias_tipos TEXT;
    END IF;
END $$;

-- Adicionar completion_token para links de completar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'completion_token') THEN
        ALTER TABLE sinistros ADD COLUMN completion_token UUID UNIQUE;
    END IF;
END $$;

-- Adicionar token_expires_at para expiração do token
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'token_expires_at') THEN
        ALTER TABLE sinistros ADD COLUMN token_expires_at TIMESTAMP;
    END IF;
END $$;

-- Adicionar created_by_manager para identificar criação pelo gerente
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'created_by_manager') THEN
        ALTER TABLE sinistros ADD COLUMN created_by_manager BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Adicionar observacoes_gerente para observações iniciais
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'observacoes_gerente') THEN
        ALTER TABLE sinistros ADD COLUMN observacoes_gerente TEXT;
    END IF;
END $$;

-- Adicionar campos para dados básicos preenchidos pelo gerente
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'cnh_proprio_nome') THEN
        ALTER TABLE sinistros ADD COLUMN cnh_proprio_nome VARCHAR(255);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'cnh_proprio_cpf') THEN
        ALTER TABLE sinistros ADD COLUMN cnh_proprio_cpf VARCHAR(14);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'crlv_proprio_placa') THEN
        ALTER TABLE sinistros ADD COLUMN crlv_proprio_placa VARCHAR(8);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'crlv_proprio_marca') THEN
        ALTER TABLE sinistros ADD COLUMN crlv_proprio_marca VARCHAR(50);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'crlv_proprio_modelo') THEN
        ALTER TABLE sinistros ADD COLUMN crlv_proprio_modelo VARCHAR(100);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'crlv_proprio_ano') THEN
        ALTER TABLE sinistros ADD COLUMN crlv_proprio_ano INTEGER;
    END IF;
END $$;

-- Adicionar campos para totais de arquivos/fotos se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'total_fotos') THEN
        ALTER TABLE sinistros ADD COLUMN total_fotos INTEGER DEFAULT 0;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'total_arquivos') THEN
        ALTER TABLE sinistros ADD COLUMN total_arquivos INTEGER DEFAULT 0;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'total_assistencias') THEN
        ALTER TABLE sinistros ADD COLUMN total_assistencias INTEGER DEFAULT 0;
    END IF;
END $$;

-- Atualizar constraint do tipo_sinistro para incluir pequenos_reparos se necessário
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
              WHERE table_name = 'sinistros' AND column_name = 'tipo_sinistro' 
              AND constraint_name LIKE '%check%') THEN
        -- Remover constraint antigo
        ALTER TABLE sinistros DROP CONSTRAINT IF EXISTS sinistros_tipo_sinistro_check;
        
        -- Adicionar novo constraint
        ALTER TABLE sinistros ADD CONSTRAINT sinistros_tipo_sinistro_check 
        CHECK (tipo_sinistro IN ('colisao', 'furto', 'roubo', 'pequenos_reparos'));
    END IF;
END $$;

-- Atualizar constraint do status para incluir aguardando_documentos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
              WHERE table_name = 'sinistros' AND column_name = 'status' 
              AND constraint_name LIKE '%check%') THEN
        -- Remover constraint antigo
        ALTER TABLE sinistros DROP CONSTRAINT IF EXISTS sinistros_status_check;
        
        -- Adicionar novo constraint
        ALTER TABLE sinistros ADD CONSTRAINT sinistros_status_check 
        CHECK (status IN ('pendente', 'aguardando_documentos', 'em_analise', 'aprovado', 'rejeitado', 'concluido'));
    END IF;
END $$;

-- Criar índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_sinistros_completion_token ON sinistros(completion_token);
CREATE INDEX IF NOT EXISTS idx_sinistros_created_by_manager ON sinistros(created_by_manager);
CREATE INDEX IF NOT EXISTS idx_sinistros_tipo_atendimento ON sinistros(tipo_atendimento);
CREATE INDEX IF NOT EXISTS idx_sinistros_cnh_cpf ON sinistros(cnh_proprio_cpf);
CREATE INDEX IF NOT EXISTS idx_sinistros_crlv_placa ON sinistros(crlv_proprio_placa);

-- Comentários nas novas colunas
COMMENT ON COLUMN sinistros.completion_token IS 'Token único para link de completar documentação';
COMMENT ON COLUMN sinistros.token_expires_at IS 'Data de expiração do token de completar';
COMMENT ON COLUMN sinistros.created_by_manager IS 'Indica se foi criado pelo gerente';
COMMENT ON COLUMN sinistros.observacoes_gerente IS 'Observações iniciais do gerente';
COMMENT ON COLUMN sinistros.tipo_atendimento IS 'Tipo principal: sinistro ou assistência';
COMMENT ON COLUMN sinistros.tipo_assistencia IS 'Tipo específico de assistência';