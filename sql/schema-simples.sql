-- ESQUEMA SIMPLIFICADO - PV AUTO PROTEÇÃO

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sequência para número do sinistro
CREATE SEQUENCE IF NOT EXISTS sinistro_seq START 1;

-- Tabela principal: SINISTROS
CREATE TABLE sinistros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_sinistro VARCHAR(20) UNIQUE NOT NULL DEFAULT 'SIN-' || to_char(CURRENT_TIMESTAMP, 'YYYY') || '-' || LPAD(NEXTVAL('sinistro_seq')::TEXT, 6, '0'),
    tipo_sinistro VARCHAR(20) NOT NULL CHECK (tipo_sinistro IN ('colisao', 'furto')),
    documentos_furtados BOOLEAN DEFAULT false,
    outros_veiculos_envolvidos BOOLEAN DEFAULT false,
    nome_completo_furto VARCHAR(255),
    cpf_furto VARCHAR(14),
    placa_veiculo_furto VARCHAR(8),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'aprovado', 'rejeitado', 'concluido')),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: DADOS CNH
CREATE TABLE dados_cnh (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sinistro_id UUID NOT NULL REFERENCES sinistros(id) ON DELETE CASCADE,
    tipo_titular VARCHAR(20) NOT NULL CHECK (tipo_titular IN ('proprio', 'terceiro')),
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    rg VARCHAR(20),
    data_nascimento DATE,
    categoria VARCHAR(10),
    numero_registro VARCHAR(20),
    data_vencimento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: DADOS CRLV
CREATE TABLE dados_crlv (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sinistro_id UUID NOT NULL REFERENCES sinistros(id) ON DELETE CASCADE,
    tipo_veiculo VARCHAR(20) NOT NULL CHECK (tipo_veiculo IN ('proprio', 'terceiro')),
    placa VARCHAR(8) NOT NULL,
    renavam VARCHAR(20),
    chassi VARCHAR(17),
    marca VARCHAR(50),
    modelo VARCHAR(100),
    ano_fabricacao INTEGER,
    ano_modelo INTEGER,
    cor VARCHAR(30),
    combustivel VARCHAR(20),
    proprietario VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: ARQUIVOS/FOTOS
CREATE TABLE arquivos_sinistro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sinistro_id UUID NOT NULL REFERENCES sinistros(id) ON DELETE CASCADE,
    tipo_arquivo VARCHAR(30) NOT NULL CHECK (tipo_arquivo IN (
        'cnh_proprio', 'cnh_terceiro', 'crlv_proprio', 'crlv_terceiro', 
        'boletim_ocorrencia', 'foto_veiculo'
    )),
    categoria_foto VARCHAR(20) CHECK (categoria_foto IN ('proprio', 'terceiro', 'geral')),
    nome_original VARCHAR(255) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    url_arquivo TEXT,
    tamanho_arquivo INTEGER,
    tipo_mime VARCHAR(100),
    foto_step_id INTEGER,
    titulo_foto VARCHAR(255),
    descricao_foto TEXT,
    obrigatoria BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: LOG DE ATIVIDADES
CREATE TABLE log_atividades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sinistro_id UUID NOT NULL REFERENCES sinistros(id) ON DELETE CASCADE,
    acao VARCHAR(50) NOT NULL,
    descricao TEXT,
    status_anterior VARCHAR(20),
    status_novo VARCHAR(20),
    usuario_id UUID,
    usuario_nome VARCHAR(255),
    usuario_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_sinistros_numero ON sinistros(numero_sinistro);
CREATE INDEX idx_sinistros_tipo ON sinistros(tipo_sinistro);
CREATE INDEX idx_sinistros_status ON sinistros(status);
CREATE INDEX idx_sinistros_data ON sinistros(data_criacao);
CREATE INDEX idx_dados_cnh_sinistro ON dados_cnh(sinistro_id);
CREATE INDEX idx_dados_cnh_cpf ON dados_cnh(cpf);
CREATE INDEX idx_dados_crlv_sinistro ON dados_crlv(sinistro_id);
CREATE INDEX idx_dados_crlv_placa ON dados_crlv(placa);
CREATE INDEX idx_arquivos_sinistro ON arquivos_sinistro(sinistro_id);
CREATE INDEX idx_log_sinistro ON log_atividades(sinistro_id);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualização automática
CREATE TRIGGER update_sinistros_updated_at BEFORE UPDATE ON sinistros
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dados_cnh_updated_at BEFORE UPDATE ON dados_cnh
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dados_crlv_updated_at BEFORE UPDATE ON dados_crlv
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_arquivos_updated_at BEFORE UPDATE ON arquivos_sinistro
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS
ALTER TABLE sinistros ENABLE ROW LEVEL SECURITY;
ALTER TABLE dados_cnh ENABLE ROW LEVEL SECURITY;
ALTER TABLE dados_crlv ENABLE ROW LEVEL SECURITY;
ALTER TABLE arquivos_sinistro ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir inserção de sinistros" ON sinistros FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura de sinistros" ON sinistros FOR SELECT USING (true);
CREATE POLICY "Permitir atualização de sinistros" ON sinistros FOR UPDATE USING (true);

CREATE POLICY "Permitir todas operações em dados_cnh" ON dados_cnh FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em dados_crlv" ON dados_crlv FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em arquivos_sinistro" ON arquivos_sinistro FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em log_atividades" ON log_atividades FOR ALL USING (true); 