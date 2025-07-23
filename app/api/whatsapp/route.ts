import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    console.log('🔍 Buscando contatos do WhatsApp...', id ? `ID: ${id}` : 'Todos')

    // Se tiver ID específico, buscar apenas esse contato
    let clientesQuery = supabase.from('clientes').select('*')
    
    if (id) {
      clientesQuery = clientesQuery.eq('id', id)
    } else {
      clientesQuery = clientesQuery.order('created_at', { ascending: false })
    }

    const { data: clientes, error: clientesError } = await clientesQuery

    if (clientesError) {
      console.error('❌ Erro ao buscar clientes:', clientesError)
      return NextResponse.json({ 
        error: 'Erro ao buscar clientes',
        details: clientesError.message 
      }, { status: 500 })
    }

    if (!clientes || clientes.length === 0) {
      console.log('📭 Nenhum cliente encontrado')
      return NextResponse.json({ 
        contatos: [],
        total: 0
      })
    }

    console.log(`✅ Encontrados ${clientes.length} clientes`)

    // Para cada cliente, buscar o último histórico pelo telefone
    const contatosComHistorico = await Promise.all(
      clientes.map(async (cliente) => {
        const { data: ultimoHistorico } = await supabase
          .from('historico_whatsapp')
          .select('*')
          .eq('fone', cliente.fone)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()



        return {
          id: cliente.id,
          name: cliente.name,
          fone: cliente.fone,
          foto_url: cliente.foto_url,
          created_at: cliente.created_at,
          ultimaMensagem: ultimoHistorico ? {
            type: ultimoHistorico.type,
            content: ultimoHistorico.content,
            created_at: ultimoHistorico.created_at
          } : null
        }
      })
    )

    console.log(`✅ Processados ${contatosComHistorico.length} contatos com histórico`)

    return NextResponse.json({
      contatos: contatosComHistorico,
      total: contatosComHistorico.length
    })

  } catch (error) {
    console.error('❌ Erro geral na API WhatsApp:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 