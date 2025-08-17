-- Adicionar coluna específica para telefone do cliente

-- Adicionar coluna telefone_cliente
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sinistros' AND column_name = 'telefone_cliente') THEN
        ALTER TABLE sinistros ADD COLUMN telefone_cliente VARCHAR(20);
    END IF;
END $$;