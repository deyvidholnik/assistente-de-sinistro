-- Script SQL SEGURO para assistências adicionais
-- Pode ser executado múltiplas vezes sem erro
-- Execute no SQL Editor do Supabase

-- 1. Adicionar campo assistencia_adicional (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sinistros' 
        AND column_name = 'assistencia_adicional'
    ) THEN
        ALTER TABLE sinistros 
        ADD COLUMN assistencia_adicional BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Campo assistencia_adicional adicionado com sucesso';
    ELSE
        RAISE NOTICE 'Campo assistencia_adicional já existe';
    END IF;
END $$;

-- 2. Criar tabela sinistros_assistencias (se não existir)
CREATE TABLE IF NOT EXISTS sinistros_assistencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sinistro_id UUID NOT NULL REFERENCES sinistros(id) ON DELETE CASCADE,
    tipo_assistencia VARCHAR(20) NOT NULL CHECK (tipo_assistencia IN (
        'hotel', 'guincho', 'taxi', 'pane_seca', 'pane_mecanica', 
        'pane_eletrica', 'trocar_pneu'
    )),
    ordem_assistencia INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN (
        'pendente', 'em_andamento', 'concluida', 'cancelada'
    )),
    observacoes TEXT,
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_conclusao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Criar índices (se não existirem)
CREATE INDEX IF NOT EXISTS idx_sinistros_assistencias_sinistro_id 
ON sinistros_assistencias(sinistro_id);

CREATE INDEX IF NOT EXISTS idx_sinistros_assistencias_tipo 
ON sinistros_assistencias(tipo_assistencia);

CREATE INDEX IF NOT EXISTS idx_sinistros_assistencias_status 
ON sinistros_assistencias(status);

-- 4. Adicionar constraint única (verificando se não existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_ordem_por_sinistro'
    ) THEN
        ALTER TABLE sinistros_assistencias 
        ADD CONSTRAINT unique_ordem_por_sinistro 
        UNIQUE (sinistro_id, ordem_assistencia);
        
        RAISE NOTICE 'Constraint unique_ordem_por_sinistro criada';
    ELSE
        RAISE NOTICE 'Constraint unique_ordem_por_sinistro já existe';
    END IF;
END $$;

-- 5. Criar trigger (verificando se não existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_sinistros_assistencias_updated_at'
    ) THEN
        CREATE TRIGGER update_sinistros_assistencias_updated_at 
        BEFORE UPDATE ON sinistros_assistencias
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
        RAISE NOTICE 'Trigger update_sinistros_assistencias_updated_at criado';
    ELSE
        RAISE NOTICE 'Trigger update_sinistros_assistencias_updated_at já existe';
    END IF;
END $$;

-- 6. Habilitar RLS (se não estiver habilitado)
DO $$
BEGIN
    -- Verifica se RLS já está habilitado
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'sinistros_assistencias'
        AND n.nspname = 'public'
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE sinistros_assistencias ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para sinistros_assistencias';
    ELSE
        RAISE NOTICE 'RLS já está habilitado para sinistros_assistencias';
    END IF;
END $$;

-- 7. Criar políticas RLS (verificando se não existem)
DO $$ 
BEGIN
    -- Política de inserção
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sinistros_assistencias' 
        AND policyname = 'Permitir inserção de assistências'
    ) THEN
        CREATE POLICY "Permitir inserção de assistências" 
        ON sinistros_assistencias FOR INSERT WITH CHECK (true);
        RAISE NOTICE 'Política de inserção criada';
    END IF;

    -- Política de leitura
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sinistros_assistencias' 
        AND policyname = 'Permitir leitura de assistências'
    ) THEN
        CREATE POLICY "Permitir leitura de assistências" 
        ON sinistros_assistencias FOR SELECT USING (true);
        RAISE NOTICE 'Política de leitura criada';
    END IF;

    -- Política de atualização
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sinistros_assistencias' 
        AND policyname = 'Permitir atualização de assistências'
    ) THEN
        CREATE POLICY "Permitir atualização de assistências" 
        ON sinistros_assistencias FOR UPDATE USING (true);
        RAISE NOTICE 'Política de atualização criada';
    END IF;
END $$;

-- 8. Atualizar view (sempre executa para garantir que está atualizada)
DROP VIEW IF EXISTS view_sinistros_completos;

CREATE VIEW view_sinistros_completos AS
SELECT 
    s.id,
    s.numero_sinistro,
    s.tipo_atendimento,
    s.tipo_sinistro,
    s.tipo_assistencia,
    s.assistencia_adicional,
    s.status,
    s.data_criacao,
    s.data_atualizacao,
    s.documentos_furtados,
    s.outros_veiculos_envolvidos,
    s.nome_completo_furto,
    s.cpf_furto,
    s.placa_veiculo_furto,
    
    -- Dados CNH próprio
    cnh_p.nome as cnh_proprio_nome,
    cnh_p.cpf as cnh_proprio_cpf,
    cnh_p.rg as cnh_proprio_rg,
    cnh_p.numero_registro as cnh_proprio_numero,
    cnh_p.data_vencimento as cnh_proprio_validade,
    cnh_p.categoria as cnh_proprio_categoria,
    
    -- Dados CRLV próprio
    crlv_p.placa as crlv_proprio_placa,
    crlv_p.marca as crlv_proprio_marca,
    crlv_p.modelo as crlv_proprio_modelo,
    crlv_p.ano_modelo as crlv_proprio_ano,
    crlv_p.cor as crlv_proprio_cor,
    crlv_p.combustivel as crlv_proprio_combustivel,
    crlv_p.renavam as crlv_proprio_renavam,
    crlv_p.chassi as crlv_proprio_chassi,
    crlv_p.proprietario as crlv_proprio_proprietario,
    
    -- Dados CNH terceiro
    cnh_t.nome as cnh_terceiros_nome,
    cnh_t.cpf as cnh_terceiros_cpf,
    cnh_t.rg as cnh_terceiros_rg,
    cnh_t.numero_registro as cnh_terceiros_numero,
    cnh_t.data_vencimento as cnh_terceiros_validade,
    cnh_t.categoria as cnh_terceiros_categoria,
    
    -- Dados CRLV terceiro
    crlv_t.placa as crlv_terceiros_placa,
    crlv_t.marca as crlv_terceiros_marca,
    crlv_t.modelo as crlv_terceiros_modelo,
    crlv_t.ano_modelo as crlv_terceiros_ano,
    crlv_t.cor as crlv_terceiros_cor,
    crlv_t.combustivel as crlv_terceiros_combustivel,
    crlv_t.renavam as crlv_terceiros_renavam,
    crlv_t.chassi as crlv_terceiros_chassi,
    crlv_t.proprietario as crlv_terceiros_proprietario,
    
    -- Contadores
    (SELECT COUNT(*) FROM arquivos_sinistro WHERE sinistro_id = s.id AND tipo_arquivo = 'foto_veiculo') as total_fotos,
    (SELECT COUNT(*) FROM arquivos_sinistro WHERE sinistro_id = s.id) as total_arquivos,
    
    -- Assistências adicionais
    (SELECT COUNT(*) FROM sinistros_assistencias WHERE sinistro_id = s.id) as total_assistencias,
    (SELECT string_agg(tipo_assistencia, ', ' ORDER BY ordem_assistencia) 
     FROM sinistros_assistencias WHERE sinistro_id = s.id) as assistencias_tipos
    
FROM sinistros s
LEFT JOIN dados_cnh cnh_p ON cnh_p.sinistro_id = s.id AND cnh_p.tipo_titular = 'proprio'
LEFT JOIN dados_cnh cnh_t ON cnh_t.sinistro_id = s.id AND cnh_t.tipo_titular = 'terceiro'
LEFT JOIN dados_crlv crlv_p ON crlv_p.sinistro_id = s.id AND crlv_p.tipo_veiculo = 'proprio'
LEFT JOIN dados_crlv crlv_t ON crlv_t.sinistro_id = s.id AND crlv_t.tipo_veiculo = 'terceiro'
ORDER BY s.data_criacao DESC;

-- 9. Verificação final
SELECT 
    'Configuração concluída!' as status,
    COUNT(*) as registros_existentes
FROM sinistros_assistencias;

-- 10. Mostrar estrutura criada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sinistros_assistencias'
ORDER BY ordinal_position; 