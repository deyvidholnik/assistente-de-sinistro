import { NextRequest, NextResponse } from 'next/server'
import { supabase, getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    // Calcular offset
    const offset = (page - 1) * limit

    // Query base
    let query = supabase
      .from('user_info')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Aplicar filtro de busca se fornecido
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    const { data: users, error, count } = await query

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar usuários'
      }, { status: 500 })
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      success: true,
      users: users || [],
      totalPages,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: totalPages
      }
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, email, user_level, full_name, password } = await request.json()

    if (!username || !email || !user_level || !full_name || !password) {
      return NextResponse.json({
        success: false,
        error: 'Todos os campos são obrigatórios'
      }, { status: 400 })
    }

    // Validar user_level
    if (!['admin', 'manager', 'user'].includes(user_level)) {
      return NextResponse.json({
        success: false,
        error: 'Nível de usuário inválido'
      }, { status: 400 })
    }

    // Criar usuário no auth do Supabase usando service role key
    const { data: authData, error: authError } = await getSupabaseAdmin().auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      console.error('Erro ao criar usuário no auth:', authError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar usuário: ' + authError.message
      }, { status: 400 })
    }

    // Criar registro na tabela user_info usando cliente normal
    const { data: userInfo, error: userError } = await supabase
      .from('user_info')
      .insert([{
        username,
        email,
        user_level,
        full_name,
        uid_auth: authData.user.id
      }])
      .select()
      .single()

    if (userError) {
      console.error('Erro ao criar registro user_info:', userError)
      // Tentar remover o usuário do auth se falhou ao criar na tabela
      await getSupabaseAdmin().auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar usuário na tabela: ' + userError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: userInfo,
      message: 'Usuário criado com sucesso'
    })

  } catch (error) {
    console.error('Erro geral ao criar usuário:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, username, email, user_level, full_name, password } = await request.json()

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID do usuário é obrigatório'
      }, { status: 400 })
    }

    // Validar user_level se fornecido
    if (user_level && !['admin', 'manager', 'user'].includes(user_level)) {
      return NextResponse.json({
        success: false,
        error: 'Nível de usuário inválido'
      }, { status: 400 })
    }

    // Preparar dados para atualização
    const updateData: any = {
      username,
      email,
      user_level,
      full_name,
      updated_at: new Date().toISOString()
    }

    // Se senha foi fornecida, atualizar no auth também
    if (password && password.trim() !== '') {
      // Buscar uid_auth do usuário
      const { data: userInfo, error: fetchError } = await supabase
        .from('user_info')
        .select('uid_auth')
        .eq('id', id)
        .single()

      if (fetchError) {
        return NextResponse.json({
          success: false,
          error: 'Usuário não encontrado'
        }, { status: 404 })
      }

      // Atualizar senha no auth
      if (userInfo.uid_auth) {
        const { error: authError } = await getSupabaseAdmin().auth.admin.updateUserById(
          userInfo.uid_auth,
          { password }
        )

        if (authError) {
          console.error('Erro ao atualizar senha:', authError)
          return NextResponse.json({
            success: false,
            error: 'Erro ao atualizar senha: ' + authError.message
          }, { status: 500 })
        }
      }
    }

    // Atualizar usuário na tabela user_info
    const { data: updatedUser, error: userError } = await supabase
      .from('user_info')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (userError) {
      console.error('Erro ao atualizar usuário:', userError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao atualizar usuário: ' + userError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Usuário atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID do usuário é obrigatório'
      }, { status: 400 })
    }

    // Buscar usuário para pegar o uid_auth
    const { data: userInfo, error: fetchError } = await supabase
      .from('user_info')
      .select('uid_auth')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({
        success: false,
        error: 'Usuário não encontrado'
      }, { status: 404 })
    }

    // Deletar usuário da tabela user_info
    const { error: deleteError } = await supabase
      .from('user_info')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erro ao deletar usuário:', deleteError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao deletar usuário: ' + deleteError.message
      }, { status: 500 })
    }

    // Deletar usuário do auth do Supabase
    if (userInfo.uid_auth) {
      const { error: authDeleteError } = await getSupabaseAdmin().auth.admin.deleteUser(userInfo.uid_auth)
      if (authDeleteError) {
        console.error('Erro ao deletar usuário do auth:', authDeleteError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
} 