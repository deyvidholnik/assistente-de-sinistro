# Mudanças no Gerenciamento de Sinistros - Assistências

## 📝 Mudanças Implementadas

### 1. **Correção da Exibição de Assistências**
- Assistências não aparecem mais como "roubo"
- Exibe corretamente "Assistência - [tipo]" (ex: "Assistência - guincho")
- Ícone específico para assistências (fone de ouvido)

### 2. **Contador de Sinistros Concluídos**
- Novo card roxo mostrando quantidade de sinistros concluídos
- Grid ajustado de 5 para 6 colunas no desktop
- Estatística em tempo real

### 3. **Interface Atualizada**
- Interface `Sinistro` agora inclui:
  - `tipo_atendimento?: string`
  - `tipo_assistencia?: string`
- Tipo de sinistro agora é opcional (para suportar assistências)

### 4. **Filtros Melhorados**
- Filtro de tipo renomeado para "Tipo de Atendimento"
- Novas opções no filtro:
  - Assistência
  - Pequenos Reparos
- Filtro funciona corretamente para assistências

### 5. **Exibição Visual**
- **Assistências**: Badge padrão (cinza) com ícone de fone
- **Pequenos Reparos**: Badge outline com ícone de chave inglesa
- **Colisão**: Badge vermelho com ícone de carro
- **Furto**: Badge secundário com ícone de escudo
- **Roubo**: Badge secundário com ícone de triângulo

### 6. **SQL Necessário**

Execute no Supabase para atualizar a view:

```sql
-- Atualizar view_sinistros_completos para incluir campos de assistência

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

## ✅ Resultado

- Assistências aparecem corretamente com o tipo específico
- Contador de concluídos visível no dashboard
- Filtros funcionando para todos os tipos
- Interface mais clara e intuitiva 