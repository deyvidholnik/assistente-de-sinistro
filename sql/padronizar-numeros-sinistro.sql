-- Script para padronizar números de sinistro existentes
-- Converte formatos antigos (ex: 25081712345) para o padrão SIN-YYYY-NNNNNN

-- 1. Primeiro, vamos verificar quantos sinistros existem com formato não padronizado
SELECT 
    'Sinistros com formato não padronizado' as tipo,
    COUNT(*) as quantidade
FROM sinistros 
WHERE numero_sinistro NOT LIKE 'SIN-%-%';

-- 2. Visualizar os números não padronizados
SELECT 
    id,
    numero_sinistro,
    data_criacao,
    created_by_manager
FROM sinistros 
WHERE numero_sinistro NOT LIKE 'SIN-%-%'
ORDER BY data_criacao;

-- 3. Encontrar o próximo número sequencial disponível
WITH ultimo_numero AS (
    SELECT 
        COALESCE(
            MAX(
                CAST(
                    SUBSTRING(numero_sinistro FROM 'SIN-[0-9]{4}-([0-9]{6})') 
                    AS INTEGER
                )
            ), 0
        ) as ultimo_seq
    FROM sinistros 
    WHERE numero_sinistro LIKE 'SIN-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-%'
)
SELECT 
    'Próximo número sequencial será:' as info,
    'SIN-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD((ultimo_seq + 1)::TEXT, 6, '0') as proximo_numero
FROM ultimo_numero;

-- 4. Atualizar sinistros não padronizados para o novo formato
-- ATENÇÃO: Execute apenas após verificar os resultados acima!

-- Criar uma tabela temporária com os novos números
CREATE TEMP TABLE temp_novos_numeros AS
WITH sinistros_nao_padronizados AS (
    SELECT 
        id,
        numero_sinistro,
        data_criacao,
        ROW_NUMBER() OVER (ORDER BY data_criacao) as ordem
    FROM sinistros 
    WHERE numero_sinistro NOT LIKE 'SIN-%-%'
),
ultimo_numero_padrao AS (
    SELECT 
        COALESCE(
            MAX(
                CAST(
                    SUBSTRING(numero_sinistro FROM 'SIN-[0-9]{4}-([0-9]{6})') 
                    AS INTEGER
                )
            ), 0
        ) as ultimo_seq
    FROM sinistros 
    WHERE numero_sinistro LIKE 'SIN-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-%'
)
SELECT 
    snp.id,
    snp.numero_sinistro as numero_antigo,
    'SIN-' || EXTRACT(YEAR FROM snp.data_criacao) || '-' || 
    LPAD((unp.ultimo_seq + snp.ordem)::TEXT, 6, '0') as numero_novo
FROM sinistros_nao_padronizados snp
CROSS JOIN ultimo_numero_padrao unp;

-- Visualizar os números que serão alterados
SELECT * FROM temp_novos_numeros;

-- DESCOMENTAR AS LINHAS ABAIXO APENAS APÓS VERIFICAR OS RESULTADOS:

/*
-- 5. Executar a atualização dos números
UPDATE sinistros 
SET 
    numero_sinistro = tnn.numero_novo,
    updated_at = CURRENT_TIMESTAMP
FROM temp_novos_numeros tnn 
WHERE sinistros.id = tnn.id;

-- 6. Verificar se a atualização foi bem-sucedida
SELECT 
    'Após atualização - Sinistros não padronizados' as status,
    COUNT(*) as quantidade
FROM sinistros 
WHERE numero_sinistro NOT LIKE 'SIN-%-%';

-- 7. Mostrar todos os números atualizados
SELECT 
    'Números atualizados' as status,
    id,
    numero_sinistro,
    data_criacao
FROM sinistros 
ORDER BY numero_sinistro;

-- 8. Atualizar a sequência para evitar conflitos futuros
SELECT setval('sinistro_seq', (
    SELECT COALESCE(
        MAX(
            CAST(
                SUBSTRING(numero_sinistro FROM 'SIN-[0-9]{4}-([0-9]{6})') 
                AS INTEGER
            )
        ), 0
    ) + 1
    FROM sinistros 
    WHERE numero_sinistro LIKE 'SIN-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-%'
));
*/

-- Limpar tabela temporária
DROP TABLE IF EXISTS temp_novos_numeros;