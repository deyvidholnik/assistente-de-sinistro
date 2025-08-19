import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

interface StatusPersonalizado {
  id?: string
  nome: string
  cor: string
  icone: string
  ordem?: number
  ativo?: boolean
}

// GET - Listar todos os status personalizados
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data: status, error } = await supabaseAdmin
      .from('status_personalizados')
      .select('*')
      .eq('ativo', true)
      .order('ordem', { ascending: true })

    if (error) {
      console.error('Erro ao buscar status personalizados:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar status personalizados' },
        { status: 500 }
      )
    }

    return NextResponse.json({ status: status || [] })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo status personalizado
export async function POST(request: NextRequest) {
  try {
    const body: StatusPersonalizado = await request.json()

    // Validações
    if (!body.nome?.trim()) {
      return NextResponse.json(
        { error: 'Nome do status é obrigatório' },
        { status: 400 }
      )
    }

    if (!body.cor?.match(/^#[0-9A-Fa-f]{6}$/)) {
      return NextResponse.json(
        { error: 'Cor deve estar no formato hexadecimal (#RRGGBB)' },
        { status: 400 }
      )
    }

    if (!body.icone?.trim()) {
      return NextResponse.json(
        { error: 'Ícone é obrigatório' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Verificar se nome já existe
    const { data: existente } = await supabaseAdmin
      .from('status_personalizados')
      .select('id')
      .eq('nome', body.nome.toLowerCase())
      .single()

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe um status com este nome' },
        { status: 409 }
      )
    }

    // Buscar próxima ordem se não especificada
    let ordem = body.ordem
    if (!ordem) {
      const { data: ultimoStatus } = await supabaseAdmin
        .from('status_personalizados')
        .select('ordem')
        .order('ordem', { ascending: false })
        .limit(1)
        .single()

      ordem = (ultimoStatus?.ordem || 0) + 1
    }

    // Inserir novo status
    const { data: novoStatus, error } = await supabaseAdmin
      .from('status_personalizados')
      .insert({
        nome: body.nome.toLowerCase(),
        cor: body.cor,
        icone: body.icone,
        ordem: ordem,
        ativo: body.ativo !== false
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar status:', error)
      return NextResponse.json(
        { error: 'Erro ao criar status personalizado' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      status: novoStatus,
      message: 'Status criado com sucesso'
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover status personalizado
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const statusId = searchParams.get('id')
    const statusNome = searchParams.get('nome')

    if (!statusId && !statusNome) {
      return NextResponse.json(
        { error: 'ID ou nome do status é obrigatório' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Verificar se status está sendo usado
    let whereClause: any = {}
    if (statusId) {
      // Buscar nome do status pelo ID
      const { data: statusData } = await supabaseAdmin
        .from('status_personalizados')
        .select('nome')
        .eq('id', statusId)
        .single()

      if (!statusData) {
        return NextResponse.json(
          { error: 'Status não encontrado' },
          { status: 404 }
        )
      }

      whereClause = { id: statusId }
    } else {
      whereClause = { nome: statusNome }
    }

    // Verificar se status está sendo usado em sinistros
    const nomeParaBuscar = statusId 
      ? (await supabaseAdmin.from('status_personalizados').select('nome').eq('id', statusId).single()).data?.nome
      : statusNome

    const { data: sinistrosUsando, error: errorSinistros } = await supabaseAdmin
      .from('sinistros')
      .select('id')
      .eq('status', nomeParaBuscar)
      .limit(1)

    if (errorSinistros) {
      console.error('Erro ao verificar uso do status:', errorSinistros)
      return NextResponse.json(
        { error: 'Erro ao verificar se status está em uso' },
        { status: 500 }
      )
    }

    if (sinistrosUsando && sinistrosUsando.length > 0) {
      return NextResponse.json(
        { 
          error: 'Este status não pode ser removido pois está sendo usado por sinistros',
          emUso: true
        },
        { status: 409 }
      )
    }

    // Remover status (soft delete - marcar como inativo)
    const { error } = await supabaseAdmin
      .from('status_personalizados')
      .update({ ativo: false })
      .match(whereClause)

    if (error) {
      console.error('Erro ao remover status:', error)
      return NextResponse.json(
        { error: 'Erro ao remover status personalizado' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Status removido com sucesso'
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}