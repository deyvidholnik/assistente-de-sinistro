const fs = require('fs')
const path = require('path')

async function setupStatusPersonalizados() {
  try {
    console.log('🚀 Configurando sistema de status personalizados...')
    
    // Ler o script SQL
    const sqlPath = path.join(__dirname, '..', 'sql', 'status-personalizados.sql')
    const sqlScript = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📄 Script SQL carregado com sucesso!')
    console.log('\n📋 O script irá executar as seguintes operações:')
    console.log('   ✅ Criar tabela status_personalizados')
    console.log('   ✅ Inserir status padrão (pendente, em_analise, etc.)')
    console.log('   ✅ Remover constraints fixas de status')
    console.log('   ✅ Criar validação dinâmica via trigger')
    console.log('   ✅ Configurar índices e políticas RLS')
    
    console.log('\n🔧 Para executar este script no Supabase:')
    console.log('   1. Acesse o Supabase Dashboard')
    console.log('   2. Vá para "SQL Editor"') 
    console.log('   3. Cole o conteúdo do arquivo sql/status-personalizados.sql')
    console.log('   4. Execute o script')
    
    console.log('\n📁 Localização do script SQL:')
    console.log(`   ${sqlPath}`)
    
    console.log('\n⚠️  IMPORTANTE: Execute o script SQL no Supabase antes de usar as novas funcionalidades!')
    
    return true
    
  } catch (error) {
    console.error('❌ Erro ao configurar status personalizados:', error)
    return false
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupStatusPersonalizados()
    .then((success) => {
      if (success) {
        console.log('\n✅ Setup concluído com sucesso!')
        console.log('   Execute o script SQL no Supabase e depois teste as funcionalidades.')
      } else {
        console.log('\n❌ Setup falhou!')
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('❌ Erro:', error)
      process.exit(1)
    })
}

module.exports = { setupStatusPersonalizados }