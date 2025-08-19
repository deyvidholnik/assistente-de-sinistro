-- Criar sistema de status personalizados
-- Este script cria a infraestrutura para permitir status customizados mantendo compatibilidade

-- 1. Criar tabela de status personalizados
CREATE TABLE IF NOT EXISTS status_personalizados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    cor VARCHAR(7) DEFAULT '#6B7280', -- hex color
    icone VARCHAR(50) DEFAULT 'circle',
    ordem INTEGER DEFAULT 999,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 2. Inserir status padrão existentes
INSERT INTO status_personalizados (nome, cor, icone, ordem, ativo) VALUES
('pendente', '#6B7280', 'clock', 1, true),
('aguardando_documentos', '#F59E0B', 'file-text', 2, true),
('em_analise', '#3B82F6', 'eye', 3, true),
('aprovado', '#10B981', 'check-circle', 4, true),
('rejeitado', '#EF4444', 'x-circle', 5, true),
('concluido', '#059669', 'check-circle-2', 6, true)
ON CONFLICT (nome) DO NOTHING;

-- 3. Remover constraint fixa de status da tabela sinistros
ALTER TABLE sinistros DROP CONSTRAINT IF EXISTS sinistros_status_check;

-- 4. Adicionar função para validar status
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

-- 5. Criar trigger para validação de status
DROP TRIGGER IF EXISTS trigger_validar_status_sinistro ON sinistros;
CREATE TRIGGER trigger_validar_status_sinistro
    BEFORE INSERT OR UPDATE OF status ON sinistros
    FOR EACH ROW
    EXECUTE FUNCTION validar_status_sinistro();

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_status_personalizados_nome ON status_personalizados(nome);
CREATE INDEX IF NOT EXISTS idx_status_personalizados_ativo ON status_personalizados(ativo);
CREATE INDEX IF NOT EXISTS idx_status_personalizados_ordem ON status_personalizados(ordem);

-- 7. Habilitar RLS para status personalizados
ALTER TABLE status_personalizados ENABLE ROW LEVEL SECURITY;

-- 8. Criar política RLS (todos podem ler, apenas service_role pode modificar)
CREATE POLICY "Permitir leitura de status personalizados para todos"
ON status_personalizados FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Permitir modificação de status personalizados apenas para service_role"
ON status_personalizados FOR ALL
TO service_role
USING (true);

-- 9. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger para atualizar updated_at
CREATE TRIGGER update_status_personalizados_updated_at
    BEFORE UPDATE ON status_personalizados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE status_personalizados IS 'Tabela para gerenciar status personalizados dos sinistros';
COMMENT ON COLUMN status_personalizados.nome IS 'Nome único do status';
COMMENT ON COLUMN status_personalizados.cor IS 'Cor em formato hexadecimal (#RRGGBB)';
COMMENT ON COLUMN status_personalizados.icone IS 'Nome do ícone do Lucide React';
COMMENT ON COLUMN status_personalizados.ordem IS 'Ordem de exibição (menor = primeiro)';
COMMENT ON COLUMN status_personalizados.ativo IS 'Se o status está ativo e pode ser usado';