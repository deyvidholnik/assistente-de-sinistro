# 🛡️ Sistema Administrativo - PV Auto Proteção

## 📋 Configuração Inicial

### 1. Executar SQL no Supabase

Execute o arquivo `sql/create-user-info.sql` no seu banco de dados Supabase para criar:

- Tabela `user_info` com níveis de usuário
- Usuário admin padrão
- Índices e triggers de segurança

```sql
-- Execute este script no SQL Editor do Supabase
-- Arquivo: sql/create-user-info.sql
```

### 2. Credenciais Padrão

O sistema cria automaticamente um usuário administrador:

```
Usuário: admin
Senha: admin123
Email: admin@pvautoprorecao.com
Nível: admin
```

## 🚀 Acessando o Sistema

### Rotas Administrativas

- **Login Admin**: `/admin/login`
- **Dashboard**: `/admin/dashboard` 
- **Chamadas IA**: `/admin/calls`
- **Redirecionamento**: `/admin` → `/admin/dashboard`

### Funcionalidades do Dashboard

#### 📊 Métricas em Tempo Real
- Total de ocorrências no período
- Chamadas da IA (total e minutos)
- Usuários cadastrados e ativos
- Estatísticas por status e tipo

#### 📈 Gráficos e Análises
- Status das ocorrências
- Agentes de IA mais ativos
- Filtros por período personalizado
- Auto-refresh a cada 5 minutos

#### 📋 Logs do Sistema
- Atividades recentes em tempo real
- Detalhes de cada ocorrência
- Status e tipos de atendimento
- Histórico completo com paginação

#### 🔗 Integração com Chamadas IA
- Acesso direto às chamadas da IA
- Métricas de duração e agentes
- Transcrições e gravações
- Filtros avançados de pesquisa

## 🔐 Segurança

### Autenticação
- Hash bcrypt para senhas
- Verificação de nível de acesso
- Session management com localStorage
- Auto-logout em caso de erro

### Proteção de Rotas
- Middleware de autenticação
- Verificação de permissões admin
- Redirecionamento automático
- Validação de tokens

## 📱 Interface

### Design Responsivo
- Baseado na landing page principal
- Modo dark/light integrado
- Animações suaves
- Cards interativos com hover effects

### Componentes
- Header com navegação e perfil
- Cards de métricas coloridos
- Tabelas responsivas de logs
- Filtros de data integrados

## 🎯 Próximos Passos

1. Execute o SQL no Supabase
2. Acesse `/admin/login`
3. Use as credenciais padrão
4. Explore o dashboard completo
5. Configure usuários adicionais se necessário

## 📞 Suporte

Em caso de problemas:
1. Verifique se o SQL foi executado corretamente
2. Confirme as credenciais no banco
3. Verifique as conexões com Supabase
4. Consulte os logs do navegador

---

**Sistema desenvolvido com Next.js 15.2, TypeScript, Tailwind CSS e Supabase** 