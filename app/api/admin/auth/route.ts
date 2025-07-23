import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Fazer login com o auth nativo do Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Buscar informações do usuário na tabela user_info usando o UUID
    const { data: userInfo, error: userError } = await supabase
      .from('user_info')
      .select('*')
      .eq('uid_auth', authData.user.id)
      .eq('is_active', true)
      .single()

    if (userError || !userInfo) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou inativo' },
        { status: 401 }
      )
    }

    // Verificar se é admin ou manager
    if (userInfo.user_level !== 'admin' && userInfo.user_level !== 'manager') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores e gerentes podem acessar.' },
        { status: 403 }
      )
    }

    // Atualizar último login
    await supabase
      .from('user_info')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userInfo.id)

    // Retornar dados do usuário
    return NextResponse.json({
      user: userInfo,
      auth: {
        id: authData.user.id,
        email: authData.user.email
      },
      session: authData.session,
      message: 'Login realizado com sucesso'
    })

  } catch (error) {
    console.error('Erro na autenticação admin:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  )
} 