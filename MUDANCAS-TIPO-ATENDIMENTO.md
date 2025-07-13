# Mudanças Implementadas - Tipo de Atendimento e Assistência

## 📝 Resumo das Mudanças

### 1. Novos Fluxos Implementados

#### Fluxo de Assistência
- **Passo 1**: Início
- **Passo 2**: Tipo de Atendimento (escolher Assistência)
- **Passo 4**: Tipo de Assistência (7 opções disponíveis)
- **Passo 6**: CNH do solicitante
- **Passo 11**: Finalização

#### Fluxo de Pequenos Reparos
- **Passo 1**: Início
- **Passo 2**: Tipo de Atendimento (escolher Sinistro)
- **Passo 3**: Tipo de Sinistro (escolher Pequenos Reparos)
- **Passo 6**: CNH do titular
- **Passo 7**: CRLV do veículo
- **Passo 9**: Fotos (apenas 2: reparo e chassi)
- **Passo 11**: Finalização

### 2. Componentes Criados/Modificados

- **`step-tipo-atendimento.tsx`**: Nova tela para escolher entre Sinistro ou Assistência
- **`step-assistencia.tsx`**: Nova tela com 7 tipos de assistência
- **`step-tipo-sinistro.tsx`**: Adicionada opção "Pequenos Reparos"
- **`step-fotos.tsx`**: Adaptado para mostrar apenas 2 fotos quando for pequenos reparos
- **`documentos-form.tsx`**: Barra de progresso simplificada para mobile

### 3. Banco de Dados

**IMPORTANTE**: Execute o seguinte SQL no Supabase antes de testar:

```sql
-- Adicionar novos campos para tipo de atendimento e assistência
-- E atualizar constraint de tipo_sinistro para incluir pequenos_reparos

-- 1. Adicionar campo tipo_atendimento
ALTER TABLE sinistros 
ADD COLUMN IF NOT EXISTS tipo_atendimento VARCHAR(20) DEFAULT 'sinistro' 
CHECK (tipo_atendimento IN ('sinistro', 'assistencia'));

-- 2. Adicionar campo tipo_assistencia
ALTER TABLE sinistros 
ADD COLUMN IF NOT EXISTS tipo_assistencia VARCHAR(20) 
CHECK (tipo_assistencia IN ('hotel', 'guincho', 'taxi', 'pane_seca', 'pane_mecanica', 'pane_eletrica', 'trocar_pneu'));

-- 3. Remover constraint antigo de tipo_sinistro
ALTER TABLE sinistros DROP CONSTRAINT IF EXISTS sinistros_tipo_sinistro_check;

-- 4. Tornar tipo_sinistro nullable
ALTER TABLE sinistros ALTER COLUMN tipo_sinistro DROP NOT NULL;

-- 5. Adicionar nova constraint incluindo pequenos_reparos
ALTER TABLE sinistros 
ADD CONSTRAINT sinistros_tipo_sinistro_check 
CHECK (tipo_sinistro IN ('colisao', 'furto', 'roubo', 'pequenos_reparos'));

-- 6. Comentário sobre os novos campos
COMMENT ON COLUMN sinistros.tipo_atendimento IS 'Tipo de atendimento: sinistro ou assistencia';
COMMENT ON COLUMN sinistros.tipo_assistencia IS 'Tipo de assistência quando tipo_atendimento = assistencia';

-- 7. Criar índice para os novos campos
CREATE INDEX IF NOT EXISTS idx_sinistros_tipo_atendimento ON sinistros(tipo_atendimento);
CREATE INDEX IF NOT EXISTS idx_sinistros_tipo_assistencia ON sinistros(tipo_assistencia);
```

### 4. Correções Aplicadas

1. **Barra de Progresso Mobile**: Agora mostra apenas "Passo X de Y" e o título do passo atual
2. **Fluxo de Assistência**: Agora coleta CNH antes da finalização
3. **Envio para Supabase**: API atualizada para enviar tipo_atendimento e tipo_assistencia

### 5. Tipos de Assistência Disponíveis

1. **Guincho**: Reboque do veículo
2. **Hotel**: Hospedagem de emergência
3. **Táxi**: Transporte alternativo
4. **Pane Seca**: Falta de combustível
5. **Pane Mecânica**: Problemas no motor
6. **Pane Elétrica**: Problemas elétricos
7. **Trocar Pneu**: Pneu furado ou danificado

### 6. Dados Enviados para o Banco

Quando o usuário finaliza, os seguintes dados são enviados:

- **Para Assistência**:
  - tipo_atendimento: 'assistencia'
  - tipo_assistencia: (hotel, guincho, taxi, etc.)
  - Dados da CNH do solicitante
  - Arquivo da CNH

- **Para Pequenos Reparos**:
  - tipo_atendimento: 'sinistro'
  - tipo_sinistro: 'pequenos_reparos'
  - Dados da CNH do titular
  - Dados do CRLV do veículo
  - Foto do reparo a ser feito
  - Foto do chassi do veículo 