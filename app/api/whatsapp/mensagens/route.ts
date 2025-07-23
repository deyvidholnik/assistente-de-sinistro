import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fone = searchParams.get('fone')

    if (!fone) {
      return NextResponse.json({ 
        error: 'Telefone é obrigatório' 
      }, { status: 400 })
    }

    console.log('🔍 Buscando mensagens para telefone:', fone)

    // Buscar todas as mensagens do telefone
    const { data: mensagens, error: mensagensError } = await supabase
      .from('historico_whatsapp')
      .select('*')
      .eq('fone', fone)
      .order('created_at', { ascending: true })

    if (mensagensError) {
      console.error('❌ Erro ao buscar mensagens:', mensagensError)
      return NextResponse.json({ 
        error: 'Erro ao buscar mensagens',
        details: mensagensError.message 
      }, { status: 500 })
    }

    if (!mensagens || mensagens.length === 0) {
      console.log('📭 Nenhuma mensagem encontrada para:', fone)
      return NextResponse.json({ 
        mensagens: [],
        total: 0
      })
    }

    console.log(`✅ Encontradas ${mensagens.length} mensagens para ${fone}`)

    // Formatar mensagens para o formato esperado
    const mensagensFormatadas = mensagens.map(msg => ({
      id: msg.id,
      type: msg.type, // 'client', 'ai', 'admin'
      content: msg.content,
      created_at: msg.created_at,
      is_sent: msg.type !== 'client' // client = recebida (esquerda), ai/admin = enviada (direita)
    }))

    return NextResponse.json({
      mensagens: mensagensFormatadas,
      total: mensagensFormatadas.length
    })

  } catch (error) {
    console.error('❌ Erro geral na API mensagens:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 