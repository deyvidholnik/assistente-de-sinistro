# Correção: Assistência Aparecendo como "Tipo não identificado"

## Problema
As assistências cadastradas estão aparecendo como "Tipo não identificado" no gerenciamento de sinistros.

## Causa Provável
A view `view_sinistros_completos` não está retornando os campos `tipo_atendimento` e `tipo_assistencia`.

## Solução

### 1. Execute o SQL de Teste no Supabase

Execute o seguinte SQL no editor SQL do Supabase para diagnosticar o problema:

```sql
-- Verificar se as colunas existem na tabela sinistros
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sinistros' 
AND column_name IN ('tipo_atendimento', 'tipo_assistencia');

-- Verificar dados de assistências na tabela
SELECT 
    numero_sinistro,
    tipo_atendimento,
    tipo_sinistro,
    tipo_assistencia,
    status,
    data_criacao
FROM sinistros
WHERE tipo_atendimento = 'assistencia'
ORDER BY data_criacao DESC;
```

### 2. Se as Colunas Não Existirem

Execute o SQL em `sql/add-tipo-atendimento.sql`:

```sql
-- Adicionar campo tipo_atendimento
ALTER TABLE sinistros 
ADD COLUMN IF NOT EXISTS tipo_atendimento VARCHAR(20) DEFAULT 'sinistro' 
CHECK (tipo_atendimento IN ('sinistro', 'assistencia'));

-- Adicionar campo tipo_assistencia
ALTER TABLE sinistros 
ADD COLUMN IF NOT EXISTS tipo_assistencia VARCHAR(20) 
CHECK (tipo_assistencia IN ('hotel', 'guincho', 'taxi', 'pane_seca', 'pane_mecanica', 'pane_eletrica', 'trocar_pneu'));

-- Tornar tipo_sinistro nullable
ALTER TABLE sinistros ALTER COLUMN tipo_sinistro DROP NOT NULL;

-- Adicionar nova constraint incluindo pequenos_reparos
ALTER TABLE sinistros DROP CONSTRAINT IF EXISTS sinistros_tipo_sinistro_check;
ALTER TABLE sinistros 
ADD CONSTRAINT sinistros_tipo_sinistro_check 
CHECK (tipo_sinistro IN ('colisao', 'furto', 'roubo', 'pequenos_reparos'));
```

### 3. Atualizar a View

Execute o SQL em `sql/update-view-assistencia.sql`:

```sql
DROP VIEW IF EXISTS view_sinistros_completos;

CREATE VIEW view_sinistros_completos AS
SELECT 
    s.id,
    s.numero_sinistro,
    s.tipo_atendimento,
    s.tipo_sinistro,
    s.tipo_assistencia,
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
    
    -- Dados CRLV próprio
    crlv_p.placa as crlv_proprio_placa,
    crlv_p.marca as crlv_proprio_marca,
    crlv_p.modelo as crlv_proprio_modelo,
    crlv_p.ano_modelo as crlv_proprio_ano,
    
    -- Dados CNH terceiro
    cnh_t.nome as cnh_terceiro_nome,
    cnh_t.cpf as cnh_terceiro_cpf,
    
    -- Dados CRLV terceiro
    crlv_t.placa as crlv_terceiro_placa,
    crlv_t.marca as crlv_terceiro_marca,
    crlv_t.modelo as crlv_terceiro_modelo,
    
    -- Contadores
    (SELECT COUNT(*) FROM arquivos_sinistro WHERE sinistro_id = s.id AND tipo_arquivo = 'foto_veiculo') as total_fotos,
    (SELECT COUNT(*) FROM arquivos_sinistro WHERE sinistro_id = s.id) as total_arquivos
    
FROM sinistros s
LEFT JOIN dados_cnh cnh_p ON cnh_p.sinistro_id = s.id AND cnh_p.tipo_titular = 'proprio'
LEFT JOIN dados_cnh cnh_t ON cnh_t.sinistro_id = s.id AND cnh_t.tipo_titular = 'terceiro'
LEFT JOIN dados_crlv crlv_p ON crlv_p.sinistro_id = s.id AND crlv_p.tipo_veiculo = 'proprio'
LEFT JOIN dados_crlv crlv_t ON crlv_t.sinistro_id = s.id AND crlv_t.tipo_veiculo = 'terceiro'
ORDER BY s.data_criacao DESC;
```

### 4. Verificar no Console do Navegador

Após executar os SQLs, recarregue a página de gerenciamento e verifique no console:
- Deve aparecer "Assistências encontradas:" com os dados
- Se aparecer "Sinistro sem tipo identificado:", verifique os valores de tipo_atendimento e tipo_assistencia

### 5. Resultado Esperado

As assistências devem aparecer como:
- **Hotel**: "Assistência - Hotel" 
- **Guincho**: "Assistência - Guincho"
- **Táxi**: "Assistência - Táxi"
- **Pane Seca**: "Assistência - Pane Seca"
- **Pane Mecânica**: "Assistência - Pane Mecânica"
- **Pane Elétrica**: "Assistência - Pane Elétrica"
- **Trocar Pneu**: "Assistência - Trocar Pneu" 