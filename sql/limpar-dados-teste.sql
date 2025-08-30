-- ========================================
-- SCRIPT DE LIMPEZA DE DADOS DE TESTE
-- ========================================
-- 
-- ATENÇÃO: Este script irá APAGAR TODOS os dados das tabelas principais do sistema!
-- Use apenas em ambiente de teste antes da entrega para o cliente.
-- 
-- Data: 30/08/2025
-- Descrição: Limpeza completa para finalizar fase de testes
-- ========================================

-- Desabilitar verificações de chave estrangeira temporariamente
SET session_replication_role = replica;

-- Limpar tabelas na ordem correta (respeitando dependências)
-- 1. Tabelas dependentes primeiro
DELETE FROM log_atividades;
DELETE FROM arquivos_sinistro;
DELETE FROM sinistros_assistencias;
DELETE FROM dados_cnh;
DELETE FROM dados_crlv;
DELETE FROM status_personalizados;

-- 2. Tabela principal
DELETE FROM sinistros;

-- 3. Tabelas de usuários/info
DELETE FROM user_info;

-- Resetar sequências existentes para começar do 1
DO $$
DECLARE
    seq_name TEXT;
BEGIN
    -- Resetar todas as sequências relacionadas às tabelas limpas
    FOR seq_name IN 
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
        AND sequence_name LIKE ANY(ARRAY['%sinistros%', '%dados_cnh%', '%dados_crlv%', '%arquivos%', '%log%', '%user_info%'])
    LOOP
        EXECUTE format('ALTER SEQUENCE %I RESTART WITH 1', seq_name);
    END LOOP;
END $$;

-- Reabilitar verificações de chave estrangeira
SET session_replication_role = DEFAULT;

-- Verificar limpeza
SELECT 
    'sinistros' as tabela, count(*) as registros_restantes FROM sinistros
UNION ALL
SELECT 'dados_cnh', count(*) FROM dados_cnh
UNION ALL
SELECT 'dados_crlv', count(*) FROM dados_crlv
UNION ALL
SELECT 'arquivos_sinistro', count(*) FROM arquivos_sinistro
UNION ALL
SELECT 'log_atividades', count(*) FROM log_atividades
UNION ALL
SELECT 'user_info', count(*) FROM user_info
UNION ALL
SELECT 'status_personalizados', count(*) FROM status_personalizados
UNION ALL
SELECT 'sinistros_assistencias', count(*) FROM sinistros_assistencias;

-- Resultado esperado: todas as tabelas devem mostrar 0 registros
-- ========================================
-- FIM DO SCRIPT
-- ========================================