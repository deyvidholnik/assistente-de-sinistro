/**
 * Script para padronizar números de sinistro
 * Executa a migração de formato antigo (ex: 25081712345) para SIN-YYYY-NNNNNN
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente SUPABASE não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verificarSinistrosNaoPadronizados() {
  console.log('🔍 Verificando sinistros com formato não padronizado...')
  
  const { data, error } = await supabase
    .from('sinistros')
    .select('id, numero_sinistro, data_criacao, created_by_manager')
    .not('numero_sinistro', 'like', 'SIN-%-%')
    .order('data_criacao')
  
  if (error) {
    console.error('❌ Erro ao buscar sinistros:', error)
    return []
  }
  
  console.log(`📊 Encontrados ${data.length} sinistros com formato não padronizado`)
  
  if (data.length > 0) {
    console.log('\n📋 Sinistros não padronizados:')
    data.forEach(sinistro => {
      console.log(`  - ${sinistro.numero_sinistro} (${sinistro.data_criacao}) ${sinistro.created_by_manager ? '[Gerente]' : '[Cliente]'}`)
    })
  }
  
  return data
}

async function obterProximoNumeroSequencial() {
  const anoAtual = new Date().getFullYear()
  const prefixo = `SIN-${anoAtual}-`
  
  const { data, error } = await supabase
    .from('sinistros')
    .select('numero_sinistro')
    .like('numero_sinistro', `${prefixo}%`)
    .order('numero_sinistro', { ascending: false })
    .limit(1)
  
  if (error) {
    console.error('❌ Erro ao buscar último número:', error)
    return 1
  }
  
  if (!data || data.length === 0) {
    return 1
  }
  
  const ultimoNumero = data[0].numero_sinistro
  const numeroAtual = parseInt(ultimoNumero.split('-')[2])
  return numeroAtual + 1
}

async function gerarNovosNumeros(sinistrosNaoPadronizados) {
  let proximoNumero = await obterProximoNumeroSequencial()
  
  const novosNumeros = sinistrosNaoPadronizados.map(sinistro => {
    const dataCriacao = new Date(sinistro.data_criacao)
    const ano = dataCriacao.getFullYear()
    const numeroFormatado = proximoNumero.toString().padStart(6, '0')
    const novoNumero = `SIN-${ano}-${numeroFormatado}`
    
    proximoNumero++
    
    return {
      id: sinistro.id,
      numeroAntigo: sinistro.numero_sinistro,
      numeroNovo: novoNumero
    }
  })
  
  return novosNumeros
}

async function executarPadronizacao(novosNumeros) {
  console.log('\n🔄 Iniciando padronização...')
  
  for (const { id, numeroAntigo, numeroNovo } of novosNumeros) {
    console.log(`  📝 ${numeroAntigo} → ${numeroNovo}`)
    
    const { error } = await supabase
      .from('sinistros')
      .update({ 
        numero_sinistro: numeroNovo,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (error) {
      console.error(`❌ Erro ao atualizar ${numeroAntigo}:`, error)
      return false
    }
  }
  
  console.log('✅ Padronização concluída!')
  return true
}

async function atualizarSequencia() {
  console.log('\n🔢 Atualizando sequência do banco...')
  
  // Buscar o maior número sequencial atual
  const anoAtual = new Date().getFullYear()
  const { data, error } = await supabase
    .from('sinistros')
    .select('numero_sinistro')
    .like('numero_sinistro', `SIN-${anoAtual}-%`)
    .order('numero_sinistro', { ascending: false })
    .limit(1)
  
  if (error) {
    console.error('❌ Erro ao buscar maior número:', error)
    return
  }
  
  if (data && data.length > 0) {
    const ultimoNumero = parseInt(data[0].numero_sinistro.split('-')[2])
    const proximoValor = ultimoNumero + 1
    
    // Executar SQL para atualizar a sequência
    const { error: seqError } = await supabase.rpc('atualizar_sequencia_sinistro', {
      novo_valor: proximoValor
    })
    
    if (seqError) {
      console.log(`📝 Sequência deve ser atualizada manualmente para: ${proximoValor}`)
      console.log(`   Execute: SELECT setval('sinistro_seq', ${proximoValor});`)
    } else {
      console.log(`✅ Sequência atualizada para: ${proximoValor}`)
    }
  }
}

async function main() {
  console.log('🚀 Iniciando padronização de números de sinistro...\n')
  
  try {
    // 1. Verificar sinistros não padronizados
    const sinistrosNaoPadronizados = await verificarSinistrosNaoPadronizados()
    
    if (sinistrosNaoPadronizados.length === 0) {
      console.log('✅ Todos os sinistros já estão padronizados!')
      return
    }
    
    // 2. Gerar novos números
    const novosNumeros = await gerarNovosNumeros(sinistrosNaoPadronizados)
    
    console.log('\n📋 Prévia das alterações:')
    novosNumeros.forEach(({ numeroAntigo, numeroNovo }) => {
      console.log(`  ${numeroAntigo} → ${numeroNovo}`)
    })
    
    // 3. Confirmar execução
    console.log('\n⚠️  ATENÇÃO: Esta operação alterará os números de sinistro!')
    console.log('Digite "CONFIRMAR" para prosseguir ou qualquer outra coisa para cancelar:')
    
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    rl.question('> ', async (answer) => {
      if (answer.toUpperCase() === 'CONFIRMAR') {
        // 4. Executar padronização
        const sucesso = await executarPadronizacao(novosNumeros)
        
        if (sucesso) {
          // 5. Atualizar sequência
          await atualizarSequencia()
          
          // 6. Verificar resultado final
          const sinistrosRestantes = await verificarSinistrosNaoPadronizados()
          if (sinistrosRestantes.length === 0) {
            console.log('\n🎉 Padronização concluída com sucesso!')
          } else {
            console.log(`\n⚠️  Ainda restam ${sinistrosRestantes.length} sinistros não padronizados`)
          }
        }
      } else {
        console.log('❌ Operação cancelada pelo usuário')
      }
      
      rl.close()
    })
    
  } catch (error) {
    console.error('❌ Erro durante a execução:', error)
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { main }