import { NextRequest, NextResponse } from 'next/server'
import { supabase, type SinistroData, type DadosCNHDB, type DadosCRLVDB, type ArquivoSinistro } from '@/lib/supabase'

// Função para obter a data atual no fuso de Brasília
function obterDataAtualBrasilia(): string {
  const agora = new Date()
  
  // Converter para horário de Brasília usando toLocaleString
  const brasiliaString = agora.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  
  // Parsear o resultado (formato: "10/07/2025, 10:18:37")
  const [dataParte, horaParte] = brasiliaString.split(', ')
  const [dia, mes, ano] = dataParte.split('/')
  const [hora, min, seg] = horaParte.split(':')
  
  // Criar data no formato ISO
  const dataFormatada = `${ano}-${mes}-${dia}T${hora}:${min}:${seg}.000-03:00`
  
  console.log('🕐 Conversão de fuso CORRIGIDA:', {
    original_UTC: agora.toISOString(),
    brasilia_locale: brasiliaString,
    resultado_final: dataFormatada,
    timezone: 'America/Sao_Paulo'
  })
  
  return dataFormatada
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    // Extrair dados do form
    const dadosFormulario = JSON.parse(formData.get('dados') as string)
    
    console.log('Dados recebidos:', dadosFormulario)

    // 1. Criar o sinistro principal
    const dataAtualBrasilia = obterDataAtualBrasilia()
    console.log('🕐 Data atual Brasília:', dataAtualBrasilia)
    
    const sinistroData: SinistroData = {
      tipo_sinistro: dadosFormulario.tipoSinistro,
      documentos_furtados: dadosFormulario.documentosFurtados || false,
      outros_veiculos_envolvidos: dadosFormulario.outrosVeiculos || false,
      nome_completo_furto: dadosFormulario.dadosFurtoSemDocumentos?.nomeCompleto || null,
      cpf_furto: dadosFormulario.dadosFurtoSemDocumentos?.cpf || null,
      placa_veiculo_furto: dadosFormulario.dadosFurtoSemDocumentos?.placaVeiculo || null,
      status: 'pendente',
      data_criacao: dataAtualBrasilia,
      data_atualizacao: dataAtualBrasilia
    }

    const { data: sinistro, error: sinistroError } = await supabase
      .from('sinistros')
      .insert([sinistroData])
      .select()
      .single()

    if (sinistroError) {
      console.error('Erro ao criar sinistro:', sinistroError)
      return NextResponse.json({ error: 'Erro ao criar sinistro' }, { status: 500 })
    }

    const sinistroId = sinistro.id

    // 2. Salvar dados da CNH (próprio)
    if (dadosFormulario.cnhData && dadosFormulario.cnhData.nome) {
      const cnhProprio: DadosCNHDB = {
        sinistro_id: sinistroId,
        tipo_titular: 'proprio',
        nome: dadosFormulario.cnhData.nome,
        cpf: dadosFormulario.cnhData.cpf,
        rg: dadosFormulario.cnhData.rg || null,
        data_nascimento: dadosFormulario.cnhData.dataNascimento || null,
        categoria: dadosFormulario.cnhData.categoria || null,
        numero_registro: dadosFormulario.cnhData.numeroRegistro || null,
        data_vencimento: dadosFormulario.cnhData.dataVencimento || null
      }

      const { error: cnhError } = await supabase
        .from('dados_cnh')
        .insert([cnhProprio])

      if (cnhError) {
        console.error('Erro ao salvar CNH próprio:', cnhError)
      }
    }

    // 3. Salvar dados da CNH (terceiro)
    if (dadosFormulario.cnhDataTerceiros && dadosFormulario.cnhDataTerceiros.nome) {
      const cnhTerceiro: DadosCNHDB = {
        sinistro_id: sinistroId,
        tipo_titular: 'terceiro',
        nome: dadosFormulario.cnhDataTerceiros.nome,
        cpf: dadosFormulario.cnhDataTerceiros.cpf,
        rg: dadosFormulario.cnhDataTerceiros.rg || null,
        data_nascimento: dadosFormulario.cnhDataTerceiros.dataNascimento || null,
        categoria: dadosFormulario.cnhDataTerceiros.categoria || null,
        numero_registro: dadosFormulario.cnhDataTerceiros.numeroRegistro || null,
        data_vencimento: dadosFormulario.cnhDataTerceiros.dataVencimento || null
      }

      const { error: cnhTerceiroError } = await supabase
        .from('dados_cnh')
        .insert([cnhTerceiro])

      if (cnhTerceiroError) {
        console.error('Erro ao salvar CNH terceiro:', cnhTerceiroError)
      }
    }

    // 4. Salvar dados do CRLV (próprio)
    if (dadosFormulario.crlvData && dadosFormulario.crlvData.placa) {
      const crlvProprio: DadosCRLVDB = {
        sinistro_id: sinistroId,
        tipo_veiculo: 'proprio',
        placa: dadosFormulario.crlvData.placa,
        renavam: dadosFormulario.crlvData.renavam || null,
        chassi: dadosFormulario.crlvData.chassi || null,
        marca: dadosFormulario.crlvData.marca || null,
        modelo: dadosFormulario.crlvData.modelo || null,
        ano_fabricacao: dadosFormulario.crlvData.anoFabricacao ? parseInt(dadosFormulario.crlvData.anoFabricacao) : undefined,
        ano_modelo: dadosFormulario.crlvData.anoModelo ? parseInt(dadosFormulario.crlvData.anoModelo) : undefined,
        cor: dadosFormulario.crlvData.cor || null,
        combustivel: dadosFormulario.crlvData.combustivel || null,
        proprietario: dadosFormulario.crlvData.proprietario || null
      }

      const { error: crlvError } = await supabase
        .from('dados_crlv')
        .insert([crlvProprio])

      if (crlvError) {
        console.error('Erro ao salvar CRLV próprio:', crlvError)
      }
    }

    // 5. Salvar dados do CRLV (terceiro)
    if (dadosFormulario.crlvDataTerceiros && dadosFormulario.crlvDataTerceiros.placa) {
      const crlvTerceiro: DadosCRLVDB = {
        sinistro_id: sinistroId,
        tipo_veiculo: 'terceiro',
        placa: dadosFormulario.crlvDataTerceiros.placa,
        renavam: dadosFormulario.crlvDataTerceiros.renavam || null,
        chassi: dadosFormulario.crlvDataTerceiros.chassi || null,
        marca: dadosFormulario.crlvDataTerceiros.marca || null,
        modelo: dadosFormulario.crlvDataTerceiros.modelo || null,
        ano_fabricacao: dadosFormulario.crlvDataTerceiros.anoFabricacao ? parseInt(dadosFormulario.crlvDataTerceiros.anoFabricacao) : undefined,
        ano_modelo: dadosFormulario.crlvDataTerceiros.anoModelo ? parseInt(dadosFormulario.crlvDataTerceiros.anoModelo) : undefined,
        cor: dadosFormulario.crlvDataTerceiros.cor || null,
        combustivel: dadosFormulario.crlvDataTerceiros.combustivel || null,
        proprietario: dadosFormulario.crlvDataTerceiros.proprietario || null
      }

      const { error: crlvTerceiroError } = await supabase
        .from('dados_crlv')
        .insert([crlvTerceiro])

      if (crlvTerceiroError) {
        console.error('Erro ao salvar CRLV terceiro:', crlvTerceiroError)
      }
    }

    // 6. Salvar arquivos
    const arquivosParaSalvar: ArquivoSinistro[] = []
    
    // Processar arquivos enviados
    const arquivosKeys = Array.from(formData.keys()).filter(key => key.startsWith('arquivo_'))
    console.log('🔍 Chaves de arquivos encontradas:', arquivosKeys)
    
    for (const key of arquivosKeys) {
      const arquivo = formData.get(key) as File
      console.log(`📁 Processando arquivo: ${key}`, {
        nome: arquivo?.name,
        tamanho: arquivo?.size,
        tipo: arquivo?.type
      })
      
      if (arquivo && arquivo.size > 0) {
        // Analisar a estrutura da key
        const keyParts = key.split('_')
        console.log('🔧 Partes da chave:', keyParts)
        
        let tipoArquivo: string
        let identificador: string
        
        if (keyParts.length >= 4 && keyParts[1] === 'foto' && keyParts[2] === 'veiculo') {
          // Formato: arquivo_foto_veiculo_stepId_index
          tipoArquivo = 'foto_veiculo'
          identificador = keyParts[3] // stepId
        } else if (keyParts.length >= 3) {
          // Formato: arquivo_tipo_subtipo_index (ex: arquivo_cnh_proprio_0)
          tipoArquivo = `${keyParts[1]}_${keyParts[2]}`
          identificador = keyParts[3] || '0'
        } else {
          console.error('❌ Formato de chave inválido:', key)
          continue
        }
        
        // Upload do arquivo para o storage do Supabase
        const nomeArquivo = `${sinistroId}/${tipoArquivo}_${identificador}_${Date.now()}_${arquivo.name}`
        console.log(`📤 Fazendo upload: ${nomeArquivo}`)
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('sinistros')
          .upload(nomeArquivo, arquivo)

        if (uploadError) {
          console.error('❌ Erro ao fazer upload do arquivo:', uploadError)
          console.error('Detalhes do erro:', {
            nomeArquivo,
            arquivo: arquivo.name,
            tamanho: arquivo.size,
            erro: uploadError
          })
          
          // Verificar se é erro de bucket não encontrado
          if (uploadError.message?.includes('Bucket not found') || JSON.stringify(uploadError).includes('404')) {
            console.error('🚨 BUCKET NÃO ENCONTRADO!')
            console.error('📋 Instruções para resolver:')
            console.error('1. Vá para o Supabase Storage')
            console.error('2. Crie um bucket chamado "sinistros"')
            console.error('3. Marque como "Public bucket"')
            console.error('4. Execute as políticas de RLS')
            console.error('5. Veja o arquivo CRIAR-BUCKET-SUPABASE.md')
            
            return NextResponse.json({ 
              error: 'Bucket de armazenamento não encontrado. Verifique as configurações do Supabase Storage.',
              details: 'O bucket "sinistros" precisa ser criado no Supabase Storage.',
              instructions: 'Veja o arquivo CRIAR-BUCKET-SUPABASE.md para instruções detalhadas.'
            }, { status: 500 })
          }
          
          continue
        }

        console.log('✅ Upload realizado com sucesso:', uploadData)

        // Obter URL pública do arquivo
        const { data: urlData } = supabase.storage
          .from('sinistros')
          .getPublicUrl(nomeArquivo)

        console.log('🔗 URL pública gerada:', urlData.publicUrl)

        const arquivoData: ArquivoSinistro = {
          sinistro_id: sinistroId,
          tipo_arquivo: tipoArquivo as any,
          nome_original: arquivo.name,
          nome_arquivo: nomeArquivo,
          url_arquivo: urlData.publicUrl,
          tamanho_arquivo: arquivo.size,
          tipo_mime: arquivo.type
        }

        // Dados específicos para fotos de veículos
        if (tipoArquivo === 'foto_veiculo') {
          const fotoStepId = parseInt(identificador)
          const fotoStep = dadosFormulario.fotoSteps?.find((step: any) => step.id === fotoStepId)
          
          if (fotoStep) {
            arquivoData.foto_step_id = fotoStepId
            arquivoData.titulo_foto = fotoStep.titulo
            arquivoData.descricao_foto = fotoStep.descricao
            arquivoData.obrigatoria = fotoStep.obrigatoria
            arquivoData.categoria_foto = fotoStep.categoria
          }
        }

        arquivosParaSalvar.push(arquivoData)
        console.log('📊 Arquivo adicionado para salvar:', arquivoData)
      }
    }

    console.log(`💾 Total de arquivos para salvar: ${arquivosParaSalvar.length}`)

    // Salvar dados dos arquivos no banco
    if (arquivosParaSalvar.length > 0) {
      const { error: arquivosError } = await supabase
        .from('arquivos_sinistro')
        .insert(arquivosParaSalvar)

      if (arquivosError) {
        console.error('Erro ao salvar dados dos arquivos:', arquivosError)
      }
    }

    // 7. Registrar log
    await supabase.from('log_atividades').insert([{
      sinistro_id: sinistroId,
      acao: 'SINISTRO_CRIADO',
      descricao: `Sinistro criado via formulário web - Tipo: ${dadosFormulario.tipoSinistro}`,
      status_novo: 'pendente',
      usuario_nome: 'Sistema Web',
      created_at: dataAtualBrasilia
    }])

    return NextResponse.json({ 
      success: true, 
      sinistro_id: sinistroId,
      numero_sinistro: sinistro.numero_sinistro,
      message: 'Sinistro salvo com sucesso!' 
    })

  } catch (error) {
    console.error('Erro geral ao salvar sinistro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 