-- Adicionar colunas para sistema de gerente - EXECUTE ESTE PRIMEIRO

-- Adicionar tipo_atendimento
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'tipo_atendimento') THEN
        ALTER TABLE sinistros ADD COLUMN tipo_atendimento VARCHAR(20);
    END IF;
END $$;

-- Adicionar tipo_assistencia
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'tipo_assistencia') THEN
        ALTER TABLE sinistros ADD COLUMN tipo_assistencia VARCHAR(30);
    END IF;
END $$;

-- Adicionar completion_token
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'completion_token') THEN
        ALTER TABLE sinistros ADD COLUMN completion_token UUID UNIQUE;
    END IF;
END $$;

-- Adicionar token_expires_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'token_expires_at') THEN
        ALTER TABLE sinistros ADD COLUMN token_expires_at TIMESTAMP;
    END IF;
END $$;

-- Adicionar created_by_manager
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'created_by_manager') THEN
        ALTER TABLE sinistros ADD COLUMN created_by_manager BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Adicionar observacoes_gerente
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'observacoes_gerente') THEN
        ALTER TABLE sinistros ADD COLUMN observacoes_gerente TEXT;
    END IF;
END $$;

-- Adicionar cnh_proprio_nome
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'cnh_proprio_nome') THEN
        ALTER TABLE sinistros ADD COLUMN cnh_proprio_nome VARCHAR(255);
    END IF;
END $$;

-- Adicionar cnh_proprio_cpf
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'cnh_proprio_cpf') THEN
        ALTER TABLE sinistros ADD COLUMN cnh_proprio_cpf VARCHAR(14);
    END IF;
END $$;

-- Adicionar crlv_proprio_placa
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'crlv_proprio_placa') THEN
        ALTER TABLE sinistros ADD COLUMN crlv_proprio_placa VARCHAR(8);
    END IF;
END $$;

-- Adicionar crlv_proprio_marca
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'crlv_proprio_marca') THEN
        ALTER TABLE sinistros ADD COLUMN crlv_proprio_marca VARCHAR(50);
    END IF;
END $$;

-- Adicionar crlv_proprio_modelo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'crlv_proprio_modelo') THEN
        ALTER TABLE sinistros ADD COLUMN crlv_proprio_modelo VARCHAR(100);
    END IF;
END $$;

-- Adicionar total_fotos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'total_fotos') THEN
        ALTER TABLE sinistros ADD COLUMN total_fotos INTEGER DEFAULT 0;
    END IF;
END $$;

-- Adicionar total_arquivos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'total_arquivos') THEN
        ALTER TABLE sinistros ADD COLUMN total_arquivos INTEGER DEFAULT 0;
    END IF;
END $$;

-- Atualizar constraint do status
DO $$
BEGIN
    ALTER TABLE sinistros DROP CONSTRAINT IF EXISTS sinistros_status_check;
    ALTER TABLE sinistros ADD CONSTRAINT sinistros_status_check 
    CHECK (status IN ('pendente', 'aguardando_documentos', 'em_analise', 'aprovado', 'rejeitado', 'concluido'));
END $$;