-- Verificar e corrigir status pendente
-- Data: 2025-01-10

-- 1. Verificar se a tabela status_personalizados existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'status_personalizados') THEN
        -- Se não existe, criar a tabela
        CREATE TABLE status_personalizados (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            nome VARCHAR(50) NOT NULL UNIQUE,
            cor VARCHAR(7) DEFAULT '#6B7280',
            icone VARCHAR(50) DEFAULT 'circle',
            ordem INTEGER DEFAULT 999,
            ativo BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        );
    END IF;
END $$;

-- 2. Inserir ou atualizar o status pendente
INSERT INTO status_personalizados (nome, cor, icone, ordem, ativo) 
VALUES ('pendente', '#6B7280', 'clock', 1, true)
ON CONFLICT (nome) 
DO UPDATE SET 
    ativo = true,
    cor = '#6B7280',
    icone = 'clock',
    ordem = 1,
    updated_at = now();

-- 3. Garantir que todos os status padrão existem e estão ativos
INSERT INTO status_personalizados (nome, cor, icone, ordem, ativo) VALUES
('aguardando_documentos', '#F59E0B', 'file-text', 2, true),
('em_analise', '#3B82F6', 'eye', 3, true),
('aprovado', '#10B981', 'check-circle', 4, true),
('rejeitado', '#EF4444', 'x-circle', 5, true),
('concluido', '#059669', 'check-circle-2', 6, true)
ON CONFLICT (nome) 
DO UPDATE SET 
    ativo = true,
    updated_at = now();

-- 4. Verificar os status ativos
SELECT nome, ativo, cor, icone, ordem 
FROM status_personalizados 
ORDER BY ordem;

-- 5. Se o trigger não existe, criar
CREATE OR REPLACE FUNCTION validar_status_sinistro()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se o status existe na tabela de status personalizados e está ativo
    IF NOT EXISTS (
        SELECT 1 FROM status_personalizados 
        WHERE nome = NEW.status AND ativo = true
    ) THEN
        RAISE EXCEPTION 'Status "%" não é válido ou não está ativo', NEW.status;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS trigger_validar_status_sinistro ON sinistros;
CREATE TRIGGER trigger_validar_status_sinistro
    BEFORE INSERT OR UPDATE OF status ON sinistros
    FOR EACH ROW
    EXECUTE FUNCTION validar_status_sinistro();