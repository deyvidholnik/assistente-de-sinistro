-- Script para corrigir erro 500 no registro de furto
-- Consolida todas as alterações necessárias na tabela sinistros

-- 1. Adicionar campo tipo_atendimento se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sinistros' 
        AND column_name = 'tipo_atendimento'
    ) THEN
        ALTER TABLE sinistros 
        ADD COLUMN tipo_atendimento VARCHAR(20) DEFAULT 'sinistro' 
        CHECK (tipo_atendimento IN ('sinistro', 'assistencia'));
        RAISE NOTICE 'Campo tipo_atendimento adicionado';
    ELSE
        RAISE NOTICE 'Campo tipo_atendimento já existe';
    END IF;
END $$;

-- 2. Adicionar campo tipo_assistencia se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sinistros' 
        AND column_name = 'tipo_assistencia'
    ) THEN
        ALTER TABLE sinistros 
        ADD COLUMN tipo_assistencia VARCHAR(20) 
        CHECK (tipo_assistencia IN ('hotel', 'guincho', 'taxi', 'pane_seca', 'pane_mecanica', 'pane_eletrica', 'trocar_pneu'));
        RAISE NOTICE 'Campo tipo_assistencia adicionado';
    ELSE
        RAISE NOTICE 'Campo tipo_assistencia já existe';
    END IF;
END $$;

-- 3. Tornar tipo_sinistro nullable (para permitir assistências)
DO $$ 
BEGIN
    -- Remover constraint NOT NULL se existir
    BEGIN
        ALTER TABLE sinistros ALTER COLUMN tipo_sinistro DROP NOT NULL;
        RAISE NOTICE 'Campo tipo_sinistro agora permite NULL';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE 'Campo tipo_sinistro já permite NULL ou erro: %', SQLERRM;
    END;
END $$;

-- 4. Atualizar constraint de tipo_sinistro para incluir pequenos_reparos
DO $$ 
BEGIN
    -- Remover constraint antigo se existir
    ALTER TABLE sinistros DROP CONSTRAINT IF EXISTS sinistros_tipo_sinistro_check;
    
    -- Adicionar nova constraint
    ALTER TABLE sinistros 
    ADD CONSTRAINT sinistros_tipo_sinistro_check 
    CHECK (tipo_sinistro IN ('colisao', 'furto', 'roubo', 'pequenos_reparos'));
    
    RAISE NOTICE 'Constraint tipo_sinistro atualizada com pequenos_reparos';
END $$;

-- 5. Adicionar campos de assistência adicional
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sinistros' 
        AND column_name = 'assistencia_adicional'
    ) THEN
        ALTER TABLE sinistros 
        ADD COLUMN assistencia_adicional BOOLEAN DEFAULT false;
        RAISE NOTICE 'Campo assistencia_adicional adicionado';
    ELSE
        RAISE NOTICE 'Campo assistencia_adicional já existe';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sinistros' 
        AND column_name = 'total_assistencias'
    ) THEN
        ALTER TABLE sinistros 
        ADD COLUMN total_assistencias INTEGER DEFAULT 0;
        RAISE NOTICE 'Campo total_assistencias adicionado';
    ELSE
        RAISE NOTICE 'Campo total_assistencias já existe';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sinistros' 
        AND column_name = 'assistencias_tipos'
    ) THEN
        ALTER TABLE sinistros 
        ADD COLUMN assistencias_tipos TEXT[];
        RAISE NOTICE 'Campo assistencias_tipos adicionado';
    ELSE
        RAISE NOTICE 'Campo assistencias_tipos já existe';
    END IF;
END $$;

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_sinistros_tipo_atendimento ON sinistros(tipo_atendimento);
CREATE INDEX IF NOT EXISTS idx_sinistros_tipo_assistencia ON sinistros(tipo_assistencia);

-- 7. Comentários sobre os campos
COMMENT ON COLUMN sinistros.tipo_atendimento IS 'Tipo de atendimento: sinistro ou assistencia';
COMMENT ON COLUMN sinistros.tipo_assistencia IS 'Tipo de assistência quando tipo_atendimento = assistencia';
COMMENT ON COLUMN sinistros.assistencia_adicional IS 'Indica se há assistências adicionais solicitadas';
COMMENT ON COLUMN sinistros.total_assistencias IS 'Número total de assistências adicionais';
COMMENT ON COLUMN sinistros.assistencias_tipos IS 'Array com tipos das assistências adicionais';

-- 8. Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sinistros' 
AND column_name IN (
    'tipo_atendimento', 'tipo_assistencia', 'tipo_sinistro',
    'assistencia_adicional', 'total_assistencias', 'assistencias_tipos'
)
ORDER BY column_name;

-- 9. Mostrar constraints atuais
SELECT conname, contype, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'sinistros'::regclass
AND contype = 'c'  -- Check constraints
ORDER BY conname;