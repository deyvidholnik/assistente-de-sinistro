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
  
  // Debug de timezone removido
  
  return dataFormatada
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    // Extrair dados do form
    const dadosFormulario = JSON.parse(formData.get('dados') as string)
    
    // Debug de dados recebidos removido
      cnhData: dadosFormulario.cnhData ? 'Presente' : 'Ausente'
    })

    // 1. Criar o sinistro principal
    const dataAtualBrasilia = obterDataAtualBrasilia()
    // Debug de data removido
    
    // Para assistências, não precisamos de tipo_sinistro
    const sinistroData: any = {
      tipo_atendimento: dadosFormulario.tipoAtendimento || 'sinistro',
      documentos_furtados: dadosFormulario.documentosFurtados || false,
      outros_veiculos_envolvidos: dadosFormulario.outrosVeiculos || false,
      status: 'pendente',
      data_criacao: dataAtualBrasilia,
      data_atualizacao: dataAtualBrasilia
    }

    // Adicionar campos condicionalmente para evitar undefined
    if (dadosFormulario.tipoAtendimento === 'assistencia') {
      if (dadosFormulario.tipoAssistencia) {
        sinistroData.tipo_assistencia = dadosFormulario.tipoAssistencia
      }
      // tipo_sinistro permanece null para assistências
    } else {
      if (dadosFormulario.tipoSinistro) {
        sinistroData.tipo_sinistro = dadosFormulario.tipoSinistro
      }
    }

    // Adicionar campos de furto se existirem
    if (dadosFormulario.dadosFurtoSemDocumentos?.nomeCompleto) {
      sinistroData.nome_completo_furto = dadosFormulario.dadosFurtoSemDocumentos.nomeCompleto
    }
    if (dadosFormulario.dadosFurtoSemDocumentos?.cpf) {
      sinistroData.cpf_furto = dadosFormulario.dadosFurtoSemDocumentos.cpf
    }
    if (dadosFormulario.dadosFurtoSemDocumentos?.placaVeiculo) {
      sinistroData.placa_veiculo_furto = dadosFormulario.dadosFurtoSemDocumentos.placaVeiculo
    }

    // Adicionar campos de assistência adicional
    if (dadosFormulario.assistenciaAdicional !== undefined) {
      sinistroData.assistencia_adicional = dadosFormulario.assistenciaAdicional
    }
    if (dadosFormulario.assistenciasAdicionais && dadosFormulario.assistenciasAdicionais.length > 0) {
      sinistroData.total_assistencias = dadosFormulario.assistenciasAdicionais.length
      sinistroData.assistencias_tipos = dadosFormulario.assistenciasAdicionais
    }

    // Debug de dados inseridos removido

    let sinistro
    let sinistroError
    
    try {
      const result = await supabase
        .from('sinistros')
        .insert([sinistroData])
        .select()
        .single()
      
      sinistro = result.data
      sinistroError = result.error

      // Se erro relacionado a campos inexistentes, tentar sem campos de assistência adicional
      if (sinistroError && (
        sinistroError.message?.includes('assistencia_adicional') ||
        sinistroError.message?.includes('total_assistencias') ||
        sinistroError.message?.includes('assistencias_tipos')
      )) {
        // Debug de inserção removido
        
        // Remover campos que podem não existir
        const sinistroDataSemAssistencia = { ...sinistroData }
        delete sinistroDataSemAssistencia.assistencia_adicional
        delete sinistroDataSemAssistencia.total_assistencias
        delete sinistroDataSemAssistencia.assistencias_tipos
        
        const resultRetry = await supabase
          .from('sinistros')
          .insert([sinistroDataSemAssistencia])
          .select()
          .single()
        
        sinistro = resultRetry.data
        sinistroError = resultRetry.error
      }
      
    } catch (insertError) {
      console.error('❌ Erro ao executar insert:', insertError)
      return NextResponse.json({ 
        error: 'Erro ao criar registro no banco de dados', 
        details: insertError instanceof Error ? insertError.message : 'Erro desconhecido'
      }, { status: 500 })
    }

    if (sinistroError) {
      console.error('❌ Erro retornado pelo Supabase:', sinistroError)
      return NextResponse.json({ 
        error: 'Erro ao criar sinistro', 
        details: sinistroError.message,
        code: sinistroError.code,
        hint: sinistroError.hint
      }, { status: 500 })
    }

    if (!sinistro) {
      console.error('❌ Nenhum sinistro retornado')
      return NextResponse.json({ error: 'Falha ao criar sinistro - nenhum dado retornado' }, { status: 500 })
    }

    console.log('✅ Sinistro criado com sucesso:', sinistro.numero_sinistro)
    const sinistroId = sinistro.id

    // 2. Salvar assistências adicionais se existirem (e se tabela existir)
    if (dadosFormulario.assistenciasAdicionais && dadosFormulario.assistenciasAdicionais.length > 0) {
      try {
        const assistenciasParaSalvar = dadosFormulario.assistenciasAdicionais.map((tipo, index) => ({
          sinistro_id: sinistroId,
          tipo_assistencia: tipo,
          ordem_assistencia: index + 1,
          created_at: dataAtualBrasilia
        }))

        const { error: assistenciasError } = await supabase
          .from('sinistros_assistencias')
          .insert(assistenciasParaSalvar)

        if (assistenciasError) {
          console.error('❌ Erro ao salvar assistências adicionais:', assistenciasError)
          console.log('💡 Possível causa: tabela sinistros_assistencias não existe. Execute o script SQL de assistências adicionais.')
        } else {
          console.log('✅ Assistências adicionais salvas:', dadosFormulario.assistenciasAdicionais)
        }
      } catch (error) {
        console.error('❌ Erro geral ao processar assistências adicionais:', error)
        console.log('💡 Tabela sinistros_assistencias pode não existir no banco de dados')
      }
    }

    // 3. Salvar dados da CNH (próprio)
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

    // 4. Salvar dados da CNH (terceiro)
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

    // 5. Salvar dados do CRLV (próprio)
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

    // 6. Salvar dados do CRLV (terceiro)
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

    // 7. Salvar arquivos
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

    // 8. Registrar log
    const tipoDescricao = dadosFormulario.tipoAtendimento === 'assistencia' 
      ? `Assistência: ${dadosFormulario.tipoAssistencia}`
      : `Sinistro: ${dadosFormulario.tipoSinistro}`
    
    // Adicionar informação sobre assistências adicionais se existirem
    const assistenciasExtras = dadosFormulario.assistenciasAdicionais && dadosFormulario.assistenciasAdicionais.length > 0
      ? ` + ${dadosFormulario.assistenciasAdicionais.length} assistências adicionais (${dadosFormulario.assistenciasAdicionais.join(', ')})`
      : ''
    
    await supabase.from('log_atividades').insert([{
      sinistro_id: sinistroId,
      acao: dadosFormulario.tipoAtendimento === 'assistencia' ? 'ASSISTENCIA_CRIADA' : 'SINISTRO_CRIADO',
      descricao: `${dadosFormulario.tipoAtendimento === 'assistencia' ? 'Assistência' : 'Sinistro'} criado via formulário web - ${tipoDescricao}${assistenciasExtras}`,
      status_novo: 'pendente',
      usuario_nome: 'Sistema Web',
      created_at: dataAtualBrasilia
    }])

    console.log('✅ Processo concluído com sucesso!')
    
    return NextResponse.json({ 
      success: true, 
      sinistro_id: sinistroId,
      numero_sinistro: sinistro.numero_sinistro,
      message: dadosFormulario.tipoAtendimento === 'assistencia' 
        ? 'Assistência registrada com sucesso!' 
        : 'Sinistro salvo com sucesso!' 
    })

  } catch (error) {
    console.error('❌ Erro geral ao salvar:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    const errorStack = error instanceof Error ? error.stack : ''
    
    console.error('Stack trace:', errorStack)
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 })
  }
} 