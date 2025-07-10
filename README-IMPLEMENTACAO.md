# Sistema de Sinistros - PV Auto Proteção

Sistema completo para coleta e gerenciamento de sinistros de veículos com integração ao Supabase.

## ✅ Funcionalidades Implementadas

### 📋 Formulário de Sinistros
- **Fluxo Completo**: 9 etapas de coleta de dados
- **Tipos de Sinistro**: Colisão e Furto
- **OCR Automático**: Extração de dados de CNH e CRLV
- **Fotos Guiadas**: Sistema de 11 tipos de fotos com instruções
- **Validação**: CPF, placa e campos obrigatórios
- **Terceiros**: Coleta de dados de outros veículos envolvidos

### 🗄️ Banco de Dados Supabase
- **Estrutura Completa**: 5 tabelas principais
- **Arquivos**: Upload e armazenamento de fotos/documentos
- **Logs**: Histórico completo de atividades
- **Índices**: Otimizados para consultas rápidas
- **Views**: Consultas pre-processadas para o gerente

### 🎛️ Painel do Gerente
- **Dashboard**: Estatísticas e métricas
- **Filtros**: Por status, tipo e busca textual
- **Detalhes**: Visualização completa dos sinistros
- **Status**: Atualização em tempo real
- **Arquivos**: Download de documentos e fotos

## 🚀 Como Configurar

### 1. Configuração do Supabase

#### 1.1 Criar o Banco de Dados
Execute o SQL no editor do Supabase:

```sql
-- Use o arquivo: sql/schema-simples.sql
-- Copie e cole todo o conteúdo no SQL Editor do Supabase
```

#### 1.2 Criar a View
Execute o SQL adicional:

```sql
-- Use o arquivo: sql/create-view.sql
-- Copie e cole no SQL Editor do Supabase
```

#### 1.3 Configurar Storage
1. Vá para **Storage** no painel do Supabase
2. Crie um bucket chamado `sinistros`
3. Configure como **público** para downloads

### 2. Configuração do Projeto

#### 2.1 Instalar Dependências
```bash
npm install @supabase/supabase-js date-fns --legacy-peer-deps
```

#### 2.2 Configurar Variáveis (Opcional)
Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://nxzzzkzuupgkqmscvscn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54enp6a3p1dXBna3Ftc2N2c2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNjEwODIsImV4cCI6MjA2NzYzNzA4Mn0.IBP0l4REyVvYrBbM6NMpMHX6e1E4xpeZEhx1yIE2bkI
```

#### 2.3 Executar o Projeto
```bash
npm run dev
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### `sinistros`
- **id**: UUID primário
- **numero_sinistro**: Número único gerado automaticamente
- **tipo_sinistro**: 'colisao' ou 'furto'
- **status**: 'pendente', 'em_analise', 'aprovado', 'rejeitado', 'concluido'
- **documentos_furtados**: Boolean
- **outros_veiculos_envolvidos**: Boolean
- **dados_furto**: Campos específicos para furto sem documentos

#### `dados_cnh`
- **sinistro_id**: FK para sinistros
- **tipo_titular**: 'proprio' ou 'terceiro'
- **dados_pessoais**: Nome, CPF, RG, etc.
- **dados_cnh**: Categoria, número, vencimento

#### `dados_crlv`
- **sinistro_id**: FK para sinistros
- **tipo_veiculo**: 'proprio' ou 'terceiro'
- **dados_veiculo**: Placa, marca, modelo, ano, etc.

#### `arquivos_sinistro`
- **sinistro_id**: FK para sinistros
- **tipo_arquivo**: CNH, CRLV, fotos, boletim
- **dados_arquivo**: URL, tamanho, tipo MIME
- **foto_detalhes**: Para fotos de veículos

#### `log_atividades`
- **sinistro_id**: FK para sinistros
- **acao**: Tipo de atividade
- **descricao**: Detalhes da atividade
- **usuario**: Quem executou

## 🔄 Fluxo de Funcionamento

### 1. Usuário Reporta Sinistro
1. Acessa a página principal (`/`)
2. Preenche o formulário em 9 etapas
3. Faz upload de documentos e fotos
4. Sistema salva automaticamente no Supabase

### 2. Gerente Visualiza
1. Acessa a página do gerente (`/gerente`)
2. Visualiza lista de sinistros
3. Filtra por status, tipo ou busca
4. Abre detalhes completos
5. Atualiza status conforme necessário

### 3. Dados Salvos
- **Sinistro**: Dados principais
- **CNH/CRLV**: Dados extraídos por OCR
- **Arquivos**: Fotos e documentos no Storage
- **Logs**: Histórico de atividades

## 🛠️ APIs Disponíveis

### POST `/api/sinistros`
Salva um sinistro completo com arquivos.

**Payload**: FormData com:
- `dados`: JSON com informações do formulário
- `arquivo_*`: Arquivos (CNH, CRLV, fotos, etc.)

**Resposta**:
```json
{
  "success": true,
  "sinistro_id": "uuid",
  "numero_sinistro": "SIN-2024-000001",
  "message": "Sinistro salvo com sucesso!"
}
```

### GET `/api/ocr`
Processa OCR de CNH e CRLV (já existente).

## 🎨 Páginas Disponíveis

### `/` - Formulário de Sinistros
- Interface responsiva para mobile/desktop
- Fluxo guiado em 9 etapas
- Validação em tempo real
- Upload de arquivos
- Salvamento automático

### `/gerente` - Painel do Gerente
- Dashboard com estatísticas
- Lista de sinistros com filtros
- Detalhes completos em modal
- Atualização de status
- Download de arquivos

## 📱 Funcionalidades Especiais

### OCR Automático
- Extrai dados de CNH e CRLV
- Validação de CPF e placa
- Correção manual disponível

### Fotos Guiadas
- 11 tipos de fotos diferentes
- Instruções específicas para cada tipo
- Validação de fotos obrigatórias

### Fluxo Inteligente
- Etapas condicionais baseadas no tipo
- Coleta de dados de terceiros
- Tratamento de documentos furtados

## 🔧 Personalização

### Adicionar Novos Campos
1. Atualizar tipos em `types/index.ts`
2. Modificar context em `context/form-context.tsx`
3. Ajustar componentes de steps
4. Atualizar schema do banco

### Modificar Validações
- Editar `lib/validations.ts`
- Ajustar regras no context
- Atualizar mensagens de erro

### Personalizar UI
- Modificar componentes em `components/ui/`
- Ajustar estilos em `globals.css`
- Customizar cores no `tailwind.config.ts`

## 🚨 Pontos Importantes

### Storage do Supabase
- Certifique-se de criar o bucket `sinistros`
- Configure as permissões adequadas
- Considere limites de tamanho

### Performance
- Índices já otimizados
- Views pre-processadas
- Lazy loading nos componentes

### Segurança
- RLS habilitado (configurar políticas)
- Validação server-side
- Sanitização de dados

## 📝 Logs e Monitoramento

### Logs Disponíveis
- Criação de sinistros
- Alterações de status
- Uploads de arquivo
- Erros de processamento

### Monitoramento
- Painel do Supabase para métricas
- Logs no console do navegador
- Alertas de erro na UI

## 🎯 Próximos Passos

### Possíveis Melhorias
- [ ] Notificações por email/SMS
- [ ] Relatórios em PDF
- [ ] Integração com APIs externas
- [ ] Dashboard analítico avançado
- [ ] Sistema de aprovação multi-nível

### Otimizações
- [ ] Cache de consultas
- [ ] Otimização de imagens
- [ ] Compressão de arquivos
- [ ] Backup automático

## 🆘 Suporte

### Problemas Comuns

**Erro ao salvar sinistro**
- Verifique conexão com Supabase
- Confirme se tabelas foram criadas
- Valide permissões do bucket

**OCR não funciona**
- Verifique API route `/api/ocr`
- Confirme se arquivos são imagens válidas
- Teste conexão de rede

**Página do gerente não carrega**
- Verifique se a view foi criada
- Confirme dados na tabela `sinistros`
- Teste consultas no SQL Editor

### Contato
Para dúvidas técnicas ou suporte, consulte:
- Documentação do Supabase
- Documentação do Next.js
- Issues do projeto no GitHub

---

**Sistema desenvolvido para PV Auto Proteção**
*Versão 1.0 - 2024* 