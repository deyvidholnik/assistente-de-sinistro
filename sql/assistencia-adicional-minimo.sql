-- Script SQL MÍNIMO para assistências adicionais
-- Adiciona apenas campos na tabela sinistros (sem tabela separada)

-- 1. Adicionar campo assistencia_adicional
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

-- 2. Adicionar campo total_assistencias
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

-- 3. Adicionar campo assistencias_tipos (array de texto)
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

-- 4. Verificar os campos adicionados
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sinistros' 
AND column_name IN ('assistencia_adicional', 'total_assistencias', 'assistencias_tipos')
ORDER BY column_name; 