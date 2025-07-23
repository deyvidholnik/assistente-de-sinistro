-- VERIFICAR DADOS EXISTENTES PARA LOGIN DO CLIENTE
-- Execute este comando no Supabase SQL Editor para verificar dados

-- 1. Verificar se existem sinistros
SELECT COUNT(*) as total_sinistros FROM sinistros;

-- 2. Verificar se existem dados CNH
SELECT COUNT(*) as total_cnh FROM dados_cnh;

-- 3. Verificar dados CNH específicos do tipo 'proprio'
SELECT 
    cnh.id,
    cnh.nome,
    cnh.cpf,
    cnh.data_nascimento,
    cnh.tipo_titular,
    s.numero_sinistro,
    s.tipo_sinistro,
    s.status
FROM dados_cnh cnh
JOIN sinistros s ON cnh.sinistro_id = s.id
WHERE cnh.tipo_titular = 'proprio'
ORDER BY cnh.created_at DESC;

-- 4. Testar a query exata que o app usa
SELECT 
    s.*,
    cnh.*
FROM sinistros s
JOIN dados_cnh cnh ON s.id = cnh.sinistro_id
WHERE cnh.cpf = '01246350599'
AND cnh.data_nascimento = '1986-08-18'
AND cnh.tipo_titular = 'proprio';

-- 5. Verificar todos os CPFs disponíveis
SELECT DISTINCT 
    cnh.cpf,
    cnh.data_nascimento,
    cnh.nome,
    s.numero_sinistro
FROM dados_cnh cnh
JOIN sinistros s ON cnh.sinistro_id = s.id
WHERE cnh.tipo_titular = 'proprio'
ORDER BY cnh.created_at DESC; 