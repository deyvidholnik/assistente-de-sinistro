# CLAUDE.md

Este arquivo fornece orientações para o Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Comandos de Desenvolvimento

### Instalação
```bash
npm install --legacy-peer-deps
```

### Desenvolvimento Local
```bash
npm run dev
```

### Build e Deploy
```bash
npm run build
npm run start
npm run build:prod
```

### Linting e Qualidade de Código
```bash
npm run lint
```

### Limpeza e Reinstalação
```bash
npm run clean
npm run reinstall
```

## Arquitetura do Sistema

### Tecnologias Principais
- **Next.js 15** com App Router
- **React 19** com TypeScript
- **Tailwind CSS** + **shadcn/ui** para componentes
- **Supabase** para banco de dados e autenticação
- **React Hook Form** com **Zod** para validação

### Estrutura da Aplicação

#### Rotas Principais
- `/` - Landing page
- `/registro_ocorrencia` - Formulário multi-step de sinistro
- `/dashboard_cliente` - Dashboard do cliente
- `/admin` - Sistema administrativo (login, dashboard, usuários, sinistros)
- `/whatsapp` - Interface de WhatsApp para gerentes
- `/gerente` - Interface específica para gerentes

#### Contextos Globais
- `AuthProvider` - Autenticação de clientes
- `AdminAuthProvider` - Autenticação de administradores
- `FormProvider` - Estado do formulário multi-step
- `ThemeProvider` - Sistema de temas (light/dark)

#### Tipos de Sinistro/Atendimento
- **Atendimento**: sinistro | assistência
- **Sinistros**: colisão | furto | roubo | pequenos_reparos
- **Assistências**: hotel | guincho | taxi | pane_seca | pane_mecanica | pane_eletrica | trocar_pneu

### Sistema Multi-Step
O formulário principal (`/registro_ocorrencia`) é um wizard de 12 etapas:
1. Início
2. Tipo de Atendimento
3. Tipo de Sinistro
4. Assistência (se aplicável)
5. Situação dos Documentos
6. CNH
7. CRLV
8. Boletim de Ocorrência
9. Fotos do Veículo (11 tipos diferentes)
10. Terceiros
11. Assistência Adicional
12. Finalização

### Banco de Dados (Supabase)
- Tabela `sinistros` - dados principais
- Tabela `cnh_dados` - informações de CNH
- Tabela `crlv_dados` - dados do veículo
- Tabela `arquivos_sinistro` - documentos e fotos
- Tabela `log_atividades` - auditoria

### Sistema de Arquivos
- Upload de documentos via Supabase Storage
- OCR automatizado para CNH e CRLV
- Sistema de fotos guiadas com 11 etapas diferentes

## Convenções de Código

### Componentes
- Usar `shadcn/ui` para componentes base
- Seguir padrões do Tailwind CSS
- Componentes de step em `components/steps/`

### Estado
- React Hook Form para formulários
- Zod para validação
- Context API para estado global

### Configurações Importantes
- ESLint e TypeScript desabilitados no build (next.config.mjs)
- Usa `--legacy-peer-deps` para instalação de dependências
- Temas gerenciados com `next-themes`
- Suporte a imagens remotas configurado

### Estrutura de Arquivos
- `/app` - rotas Next.js App Router
- `/components` - componentes reutilizáveis
- `/lib` - utilitários (Supabase, auth, validações)
- `/types` - definições TypeScript
- `/constants` - constantes (steps, configurações)
- `/context` - provedores de contexto
- `/sql` - scripts de banco de dados

## Alterações Manuais Recentes

### 16/08/2025 - Padronização e Dark Mode
**Commit:** `034cf1c` - refactor: padronização de formatação e ajustes de tema dark mode

**Arquivos Modificados:**
- `components/ui/card.tsx` - Ajuste de background com opacity para melhor visualização em dark mode
- `app/gerente/gerente-filtros.tsx` - Adição de classes `text-foreground` para visibilidade em tema escuro
- `app/gerente/gerente-estatisticas.tsx` - Formatação de código (aspas simples)
- `app/gerente/page.tsx` - Ajustes menores de formatação
- `app/admin/calls/page.tsx` - Padronização de código
- `app/globals.css` - Adições de estilo global

**Principais Mudanças:**
1. **Formatação:** Padronização de aspas duplas para simples em componentes React
2. **Dark Mode:** Implementação de melhor suporte ao tema escuro com:
   - Background com opacity em cards (`bg-card-foreground/50`)
   - Classes `text-foreground` para garantir contraste adequado
3. **Reorganização:** Reformatação de componentes para melhor legibilidade

**Motivo:** Melhorar a experiência do usuário em dark mode e padronizar o código

### 16/08/2025 - Melhorias Visuais em Detalhes de Sinistro
**Commit:** `cbafc44` - refactor: padronização e melhorias visuais em gerente-detalhes-sinistro

**Arquivo Modificado:**
- `app/gerente/gerente-detalhes-sinistro.tsx` - Refatoração completa do componente de detalhes

**Principais Mudanças:**
1. **Formatação:** Conversão completa de aspas duplas para simples
2. **Design System:** 
   - Implementação de gradiente de fundo responsivo (dark: gray-900/blue-900/purple-900, light: blue-50/indigo-50/purple-50)
   - Substituição de `border border-gray-200 bg-white` por `bg-card/50` para melhor integração com tema
   - Adição de padding e border-radius no container principal
3. **Dark Mode:** 
   - Mudança de classes de cor para `text-foreground` e `text-muted-foreground`
   - Melhor contraste e legibilidade em modo escuro
4. **Responsividade:** Ajustes de espaçamento e layout para mobile/desktop
5. **Limpeza:** Remoção de linhas vazias desnecessárias e formatação consistente

**Motivo:** Modernizar a interface visual do componente de detalhes de sinistro com melhor suporte a temas e design mais polido

## Processo de Documentação de Alterações Manuais

**IMPORTANTE**: Sempre que o usuário informar que fez alterações manuais no código, seguir automaticamente este processo:

1. **Analisar mudanças** com `git status` e `git diff`
2. **Criar commit descritivo** com todas as alterações
3. **Atualizar esta seção** do CLAUDE.md com:
   - Data da alteração
   - Arquivos modificados
   - Descrição das mudanças
   - Motivo/contexto
4. **Adicionar comentários** nos arquivos principais modificados indicando:
   - Data da alteração manual
   - Breve descrição da mudança
   - Diferença do código original (quando relevante)

Este processo garante rastreabilidade e contexto para futuras manutenções.