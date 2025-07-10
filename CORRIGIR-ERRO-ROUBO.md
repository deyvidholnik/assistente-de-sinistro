# Corrigir Erro 500 - Tipo de Sinistro "Roubo"

## Problema

Erro 500 (Internal Server Error) ao finalizar sinistro do tipo "roubo":
```
POST http://localhost:3000/api/sinistros 500 (Internal Server Error)
```

## Causa

A tabela `sinistros` no banco de dados Supabase tem uma constraint CHECK que só permite os valores 'colisao' e 'furto', mas não 'roubo'.

## Solução

### 1. Executar SQL no Supabase

1. Acesse o Supabase Dashboard
2. Vá para **Database** → **SQL Editor**
3. Execute o seguinte SQL:

```sql
-- Primeiro, remover a constraint existente
ALTER TABLE sinistros DROP CONSTRAINT IF EXISTS sinistros_tipo_sinistro_check;

-- Adicionar nova constraint com 'roubo' incluído
ALTER TABLE sinistros ADD CONSTRAINT sinistros_tipo_sinistro_check 
    CHECK (tipo_sinistro IN ('colisao', 'furto', 'roubo'));
```

### 2. Verificar se funcionou

Execute esta consulta para verificar:
```sql
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'sinistros' 
AND n.nspname = 'public'
AND c.conname = 'sinistros_tipo_sinistro_check';
```

Deve retornar:
```
constraint_name               | constraint_type | constraint_definition
sinistros_tipo_sinistro_check | c              | CHECK ((tipo_sinistro)::text = ANY ((ARRAY['colisao'::character varying, 'furto'::character varying, 'roubo'::character varying])::text[]))
```

### 3. Testar novamente

Após aplicar a correção, teste criando um sinistro do tipo "roubo" no formulário.

## Arquivos Atualizados

- `sql/schema-simples.sql` - Schema atualizado com 'roubo'
- `sql/add-roubo-tipo-sinistro.sql` - Script para aplicar a correção

## Validação

✅ Schema do banco atualizado  
✅ Constraint modificada  
✅ Tipo 'roubo' adicionado à validação  
✅ API preparada para receber 'roubo'  
✅ Frontend implementado com opção 'roubo'  

## Observações

- A API já estava preparada para receber qualquer tipo de sinistro
- O problema estava apenas na constraint do banco de dados
- Não é necessário reiniciar a aplicação, apenas aplicar o SQL no Supabase 