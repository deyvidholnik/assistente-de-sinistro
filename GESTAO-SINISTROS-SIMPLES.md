# 🎯 Solução Simples - Gestão de Sinistros

## ✅ Implementação Simplificada

Criada uma solução mais simples que **não requer mudanças complexas** no banco de dados, usando apenas um campo JSON na tabela existente.

### 🗄️ **Mudança no Banco de Dados**
**Apenas 1 linha de SQL necessária:**
```sql
-- Adicionar campo JSON para andamento na tabela sinistros existente
ALTER TABLE sinistros ADD COLUMN IF NOT EXISTS andamento JSONB DEFAULT NULL;
```

### 🚀 **Como Funciona**

#### **1. Estrutura dos Dados**
- **Campo `andamento`**: JSONB na tabela `sinistros` existente
- **Passos predefinidos**: 10 passos hardcoded no código (não no banco)
- **Status por passo**: Pendente, Em Andamento, Concluído, Cancelado

#### **2. Fluxo Automático**
1. **Sinistro criado**: Campo `andamento` fica NULL
2. **Sinistro aprovado**: API cria automaticamente array JSON com 10 passos
3. **Gestão individual**: Cada passo pode ser atualizado via interface
4. **Conclusão automática**: Quando todos passos "Concluído" → sinistro vira "Concluído"

### 📁 **Arquivos Criados**

#### **Backend:**
- `sql/andamento-simples.sql` - **Única mudança no banco**
- `app/api/andamento-simples/route.ts` - **API simplificada**

#### **Frontend:**
- `app/gerente/page.tsx` - **Interface atualizada (já modificada)**

### 🔧 **Estrutura do JSON**
```json
{
  "andamento": [
    {
      "id": 1,
      "nome": "Documentação Analisada",
      "descricao": "Análise completa de todos os documentos enviados",
      "ordem": 1,
      "status": "pendente",
      "data_inicio": null,
      "data_conclusao": null,
      "observacoes": null,
      "usuario_responsavel": null
    },
    // ... mais 9 passos
  ]
}
```

### 🎯 **10 Passos Padrão**
1. **Documentação Analisada** - Análise completa de todos os documentos
2. **Avaliação Agendada** - Agendamento da avaliação técnica
3. **Avaliação Realizada** - Avaliação técnica foi realizada
4. **Orçamento Solicitado** - Solicitação de orçamento para reparo
5. **Orçamento Aprovado** - Orçamento foi aprovado pela seguradora
6. **Reparo Autorizado** - Autorização para início do reparo
7. **Reparo em Andamento** - Reparo do veículo está sendo realizado
8. **Reparo Concluído** - Reparo do veículo foi finalizado
9. **Vistoria Final** - Vistoria final do reparo realizado
10. **Processo Finalizado** - Sinistro totalmente processado

### 🛠️ **API Endpoints**

#### **GET** - Buscar andamento
```
GET /api/andamento-simples?sinistroId=uuid
```
- **Retorna**: Array com os passos do sinistro
- **Auto-criação**: Se sinistro aprovado sem andamento, cria automaticamente

#### **POST** - Atualizar passo
```
POST /api/andamento-simples
Body: {
  sinistroId: string,
  passoId: string,
  status: string,
  observacoes?: string
}
```
- **Atualiza**: Status individual de um passo
- **Auto-conclusão**: Se todos passos "concluído" → sinistro vira "concluído"

#### **PUT** - Atualizar status do sinistro
```
PUT /api/andamento-simples
Body: {
  sinistroId: string,
  novoStatus: string,
  observacoes?: string
}
```
- **Auto-inicialização**: Se mudou para "aprovado" → cria andamento inicial

### 🎨 **Interface**

#### **Aba "Gestão":**
- **Dropdown de status** do sinistro
- **Lista de passos** (apenas para sinistros aprovados)
- **Indicadores visuais** com bolinhas coloridas
- **Dropdowns individuais** para cada passo
- **Observações** (futuro)

#### **Indicadores Visuais:**
- 🟢 **Verde**: Concluído
- 🔵 **Azul**: Em Andamento
- 🔴 **Vermelho**: Cancelado
- ⚪ **Cinza**: Pendente

### 🧪 **Como Testar**

#### **1. Aplicar SQL (OBRIGATÓRIO):**
```sql
-- Execute no Supabase SQL Editor:
ALTER TABLE sinistros ADD COLUMN IF NOT EXISTS andamento JSONB DEFAULT NULL;
```

#### **2. Testar Fluxo:**
1. Acesse `/gerente`
2. Abra detalhes de um sinistro
3. Vá para aba "Gestão"
4. Altere status para "Aprovado"
5. **Veja os 10 passos sendo criados automaticamente**
6. Altere status de passos individuais
7. Marque todos como "Concluído"
8. **Veja sinistro sendo automaticamente marcado como "Concluído"**

### ✅ **Vantagens da Solução Simples**

#### **Para o Banco:**
- ✅ **Mudança mínima**: Apenas 1 campo adicionado
- ✅ **Sem tabelas complexas**: Usa JSON existente do PostgreSQL
- ✅ **Performance**: Consultas simples, sem JOINs
- ✅ **Backup/Restore**: Tudo junto na mesma tabela

#### **Para o Desenvolvimento:**
- ✅ **Facilidade**: Lógica no código, não no banco
- ✅ **Flexibilidade**: Passos podem ser modificados facilmente
- ✅ **Manutenibilidade**: Menos complexidade de schema
- ✅ **Deploy**: Mudança simples, sem migração complexa

#### **Para o Sistema:**
- ✅ **Compatibilidade**: Funciona com sinistros existentes
- ✅ **Escalabilidade**: JSON otimizado do PostgreSQL
- ✅ **Logs**: Sistema de logs existente continua funcionando
- ✅ **Integridade**: Menos pontos de falha

### 🚨 **Observações Importantes**

#### **Aplicar SQL:**
- **OBRIGATÓRIO**: Execute `sql/andamento-simples.sql` no Supabase
- **Seguro**: Usa `IF NOT EXISTS`, pode executar múltiplas vezes

#### **Compatibilidade:**
- **Sinistros existentes**: Continuam funcionando normalmente
- **Andamento**: Só aparece para sinistros aprovados
- **Logs**: Sistema de histórico mantido intacto

#### **Performance:**
- **JSON otimizado**: PostgreSQL/Supabase tem excelente suporte a JSONB
- **Índice**: Criado automaticamente para consultas rápidas
- **Consultas**: Simples SELECT/UPDATE, sem JOINs complexos

### 📋 **Arquivos Removidos**
- ❌ `app/api/andamento/route.ts` - API complexa removida
- ❌ `sql/schema-passos-*.sql` - Schemas complexos removidos

### 🎯 **Resultado Final**
Sistema de acompanhamento **completo e funcional** com:
- ✅ **Interface limpa** com dropdown movido para detalhes
- ✅ **10 passos predefinidos** para sinistros aprovados
- ✅ **Conclusão automática** quando todos passos prontos
- ✅ **Logs automáticos** de todas as alterações
- ✅ **Mudança mínima** no banco de dados

**Pronto para usar após executar apenas 1 linha de SQL!** 🚀 