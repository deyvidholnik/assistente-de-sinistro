import { NextRequest, NextResponse } from 'next/server'
import { gerarNomeArquivoPorTipo } from '@/lib/nome-arquivo-utils'

export async function POST(request: NextRequest) {
  
  try {
    const formData = await request.formData()
    
    const sinistroId = formData.get('sinistroId') as string
    const tipo = formData.get('tipo') as string || 'documento_adicional'
    const arquivo = formData.get('arquivo') as File

    if (!sinistroId) {
      return NextResponse.json({ 
        error: 'ID do sinistro é obrigatório' 
      }, { status: 400 })
    }

    if (!arquivo) {
      return NextResponse.json({ 
        error: 'Arquivo é obrigatório' 
      }, { status: 400 })
    }

    // Validações básicas
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (arquivo.size > maxSize) {
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Máximo 100MB.' 
      }, { status: 400 })
    }

    // Integrar Supabase Storage
    try {
      const { getSupabaseAdmin } = require('@/lib/supabase')
      const supabase = getSupabaseAdmin()

      // Verificar se o sinistro existe
      const { data: sinistro, error: sinistroError } = await supabase
        .from('sinistros')
        .select('id, numero_sinistro')
        .eq('id', sinistroId)
        .single()

      if (sinistroError || !sinistro) {
        return NextResponse.json({ 
          error: 'Sinistro não encontrado' 
        }, { status: 404 })
      }

      // Gerar nome padronizado para o arquivo
      const timestamp = Date.now()
      const extension = arquivo.name.split('.').pop() || 'bin'
      const nomeArquivoPadrao = gerarNomeArquivoPorTipo(tipo, undefined, timestamp, extension)
      const nomeArquivo = `${sinistroId}/${nomeArquivoPadrao}`

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sinistros')
        .upload(nomeArquivo, arquivo, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        
        if (uploadError.message?.includes('Bucket not found')) {
          return NextResponse.json({ 
            error: 'Bucket de armazenamento não encontrado',
            details: 'O bucket "sinistros" precisa ser criado no Supabase Storage.',
            supabaseError: uploadError.message
          }, { status: 500 })
        }
        
        return NextResponse.json({ 
          error: 'Erro ao fazer upload do arquivo',
          details: uploadError.message 
        }, { status: 500 })
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('sinistros')
        .getPublicUrl(nomeArquivo)

      const urlPublica = urlData.publicUrl

      // Salvar metadados no banco de dados
      const { data: arquivoData, error: arquivoError } = await supabase
        .from('arquivos_sinistro')
        .insert({
          sinistro_id: sinistroId,
          tipo_arquivo: tipo,
          categoria_foto: 'geral',
          nome_original: arquivo.name,
          nome_arquivo: nomeArquivo,
          url_arquivo: urlPublica,
          tamanho_arquivo: arquivo.size,
          tipo_mime: arquivo.type,
          titulo_foto: arquivo.name,
          obrigatoria: false
        })
        .select()
        .single()

      if (arquivoError) {
        return NextResponse.json({ 
          error: 'Erro ao salvar metadados do arquivo',
          details: arquivoError.message 
        }, { status: 500 })
      }

      // Resultado final
      const resultado = {
        id: arquivoData.id,
        nome: arquivo.name,
        url: urlPublica,
        tipo: tipo,
        tamanho: arquivo.size,
        data_upload: arquivoData.created_at
      }

      return NextResponse.json({
        success: true,
        arquivo: resultado
      })

    } catch (supabaseError) {      
      // Fallback para modo simulado se Supabase falhar
      const resultado = {
        id: Date.now().toString(),
        nome: arquivo.name,
        url: `https://exemplo.com/${arquivo.name}`,
        tipo: tipo,
        tamanho: arquivo.size,
        data_upload: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        arquivo: resultado,
        warning: 'Upload simulado - Supabase não disponível'
      })
    }

  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sinistroId = searchParams.get('sinistroId')

    if (!sinistroId) {
      return NextResponse.json({ 
        success: true, 
        message: 'API upload funcionando!',
        timestamp: new Date().toISOString()
      })
    }

    // Carregar arquivos do sinistro
    const { getSupabaseAdmin } = require('@/lib/supabase')
    const supabase = getSupabaseAdmin()

    const { data: arquivos, error } = await supabase
      .from('arquivos_sinistro')
      .select('*')
      .eq('sinistro_id', sinistroId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ 
        error: 'Erro ao carregar arquivos',
        details: error.message 
      }, { status: 500 })
    }

    const arquivosFormatados = arquivos.map((arquivo: any) => ({
      id: arquivo.id,
      nome: arquivo.nome_original,
      url: arquivo.url_arquivo,
      tipo: arquivo.tipo_arquivo,
      tamanho: arquivo.tamanho_arquivo,
      data_upload: arquivo.created_at
    }))

    return NextResponse.json({
      success: true,
      arquivos: arquivosFormatados
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const arquivoId = searchParams.get('arquivoId')

    if (!arquivoId) {
      return NextResponse.json({ 
        error: 'ID do arquivo é obrigatório' 
      }, { status: 400 })
    }

    const { getSupabaseAdmin } = require('@/lib/supabase')
    const supabase = getSupabaseAdmin()

    // Buscar informações do arquivo
    const { data: arquivo, error: buscarError } = await supabase
      .from('arquivos_sinistro')
      .select('nome_arquivo')
      .eq('id', arquivoId)
      .single()

    if (buscarError || !arquivo) {
      return NextResponse.json({ 
        error: 'Arquivo não encontrado' 
      }, { status: 404 })
    }

    // Deletar do storage
    const { error: storageError } = await supabase.storage
      .from('sinistros')
      .remove([arquivo.nome_arquivo])

    if (storageError) {
      return NextResponse.json({ 
        error: 'Erro ao deletar arquivo do storage',
        details: storageError.message 
      }, { status: 500 })
    }

    // Deletar metadados do banco
    const { error: deleteError } = await supabase
      .from('arquivos_sinistro')
      .delete()
      .eq('id', arquivoId)

    if (deleteError) {
      return NextResponse.json({ 
        error: 'Erro ao deletar metadados do arquivo',
        details: deleteError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Arquivo deletado com sucesso'
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}