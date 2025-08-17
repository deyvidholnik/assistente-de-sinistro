import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { sinistroId } = await request.json()

    if (!sinistroId) {
      return NextResponse.json(
        { error: 'ID do sinistro é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o sinistro existe e foi criado pelo gerente
    const { data: sinistro, error: sinistroError } = await supabase
      .from('sinistros')
      .select('id, numero_sinistro, created_by_manager, completion_token, token_expires_at')
      .eq('id', sinistroId)
      .single()

    if (sinistroError || !sinistro) {
      return NextResponse.json(
        { error: 'Sinistro não encontrado' },
        { status: 404 }
      )
    }

    if (!sinistro.created_by_manager) {
      return NextResponse.json(
        { error: 'Apenas sinistros criados pelo gerente podem ter link de completar' },
        { status: 403 }
      )
    }

    let token = sinistro.completion_token
    let expiresAt = sinistro.token_expires_at

    // Se não tem token ou expirou, gerar novo
    if (!token || !expiresAt || new Date(expiresAt) < new Date()) {
      token = crypto.randomUUID()
      
      // Token expira em 30 dias
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 30)
      expiresAt = expiry.toISOString()

      // Atualizar no banco
      const { error: updateError } = await supabase
        .from('sinistros')
        .update({
          completion_token: token,
          token_expires_at: expiresAt
        })
        .eq('id', sinistroId)

      if (updateError) {
        console.error('Erro ao atualizar token:', updateError)
        return NextResponse.json(
          { error: 'Erro ao gerar token' },
          { status: 500 }
        )
      }
    }

    // Gerar o link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const link = `${baseUrl}/completar-ocorrencia/${sinistroId}?token=${token}`

    // Registrar log
    await supabase.from('log_atividades').insert([
      {
        sinistro_id: sinistroId,
        acao: 'LINK_GERADO',
        descricao: 'Link de completar documentação gerado pelo gerente',
        usuario_nome: 'Gerente',
        created_at: new Date().toISOString(),
      },
    ])

    return NextResponse.json({
      success: true,
      link,
      token,
      expiresAt,
      numeroSinistro: sinistro.numero_sinistro
    })

  } catch (error) {
    console.error('Erro na API completar-link:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sinistroId = searchParams.get('sinistroId')
    const token = searchParams.get('token')

    if (!sinistroId || !token) {
      return NextResponse.json(
        { error: 'ID do sinistro e token são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o token é válido
    const { data: sinistro, error: sinistroError } = await supabase
      .from('sinistros')
      .select('*')
      .eq('id', sinistroId)
      .eq('completion_token', token)
      .single()

    if (sinistroError || !sinistro) {
      return NextResponse.json(
        { error: 'Token inválido ou sinistro não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o token expirou
    if (sinistro.token_expires_at && new Date(sinistro.token_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 401 }
      )
    }

    // Registrar acesso
    await supabase.from('log_atividades').insert([
      {
        sinistro_id: sinistroId,
        acao: 'LINK_ACESSADO',
        descricao: 'Cliente acessou link de completar documentação',
        usuario_nome: 'Cliente',
        created_at: new Date().toISOString(),
      },
    ])

    return NextResponse.json({
      success: true,
      sinistro,
      valid: true
    })

  } catch (error) {
    console.error('Erro na validação do token:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}