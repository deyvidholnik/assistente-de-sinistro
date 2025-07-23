-- VERIFICAR DADOS DO WHATSAPP BUSINESS

-- 1. Verificar se existem clientes
SELECT COUNT(*) as total_clientes FROM clientes;

-- 2. Verificar dados dos clientes e fotos
SELECT 
    id,
    name,
    fone,
    foto_url,
    created_at
FROM clientes 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Verificar se há mensagens
SELECT COUNT(*) as total_mensagens FROM historico_whatsapp;

-- 4. Verificar algumas mensagens
SELECT 
    h.id,
    h.fone,
    c.name,
    h.type,
    h.content,
    h.created_at
FROM historico_whatsapp h
LEFT JOIN clientes c ON h.fone = c.fone
ORDER BY h.created_at DESC
LIMIT 10;

-- 5. Verificar clientes SEM foto
SELECT 
    name,
    fone,
    foto_url
FROM clientes 
WHERE foto_url IS NULL OR foto_url = '';

-- 6. Verificar clientes COM foto
SELECT 
    name,
    fone,
    foto_url
FROM clientes 
WHERE foto_url IS NOT NULL AND foto_url != '';

-- 7. Verificar estrutura das tabelas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'historico_whatsapp' 
ORDER BY ordinal_position; 