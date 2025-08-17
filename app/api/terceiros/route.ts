import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validarCPF, validarPlaca } from '@/lib/validations'

// POST - Adicionar condutor ou veículo terceiro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo, sinistroId, ...dados } = body

    if (!tipo || !sinistroId) {
      return NextResponse.json(
        { error: 'Tipo e sinistroId são obrigatórios' },
        { status: 400 }
      )
    }

    if (tipo === 'condutor') {
      return await adicionarCondutor(sinistroId, dados)
    } else if (tipo === 'veiculo') {
      return await adicionarVeiculo(sinistroId, dados)
    } else {
      return NextResponse.json(
        { error: 'Tipo deve ser "condutor" ou "veiculo"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Erro na API terceiros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar condutor ou veículo terceiro
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo, id, ...dados } = body

    if (!tipo || !id) {
      return NextResponse.json(
        { error: 'Tipo e ID são obrigatórios' },
        { status: 400 }
      )
    }

    if (tipo === 'condutor') {
      return await atualizarCondutor(id, dados)
    } else if (tipo === 'veiculo') {
      return await atualizarVeiculo(id, dados)
    } else {
      return NextResponse.json(
        { error: 'Tipo deve ser "condutor" ou "veiculo"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Erro ao atualizar terceiro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover condutor ou veículo terceiro
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const tipo = url.searchParams.get('tipo')
    const id = url.searchParams.get('id')

    if (!tipo || !id) {
      return NextResponse.json(
        { error: 'Tipo e ID são obrigatórios' },
        { status: 400 }
      )
    }

    if (tipo === 'condutor') {
      return await removerCondutor(id)
    } else if (tipo === 'veiculo') {
      return await removerVeiculo(id)
    } else {
      return NextResponse.json(
        { error: 'Tipo deve ser "condutor" ou "veiculo"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Erro ao remover terceiro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Funções auxiliares para condutor
async function adicionarCondutor(sinistroId: string, dados: any) {
  const { nome, cpf, rg, dataNascimento, categoria, numeroRegistro, dataVencimento } = dados

  // Validações
  if (!nome || !cpf) {
    return NextResponse.json(
      { error: 'Nome e CPF são obrigatórios' },
      { status: 400 }
    )
  }

  if (!validarCPF(cpf)) {
    return NextResponse.json(
      { error: 'CPF inválido' },
      { status: 400 }
    )
  }

  // Verificar se CPF já existe para este sinistro
  const { data: existente } = await supabase
    .from('dados_cnh')
    .select('id')
    .eq('sinistro_id', sinistroId)
    .eq('cpf', cpf)
    .eq('tipo_titular', 'terceiro')
    .single()

  if (existente) {
    return NextResponse.json(
      { error: 'CPF já cadastrado para este sinistro' },
      { status: 400 }
    )
  }

  // Inserir condutor terceiro
  const { data, error } = await supabase
    .from('dados_cnh')
    .insert({
      sinistro_id: sinistroId,
      tipo_titular: 'terceiro',
      nome: nome.trim(),
      cpf: cpf.trim(),
      rg: rg?.trim() || null,
      data_nascimento: dataNascimento || null,
      categoria: categoria || null,
      numero_registro: numeroRegistro?.trim() || null,
      data_vencimento: dataVencimento || null
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao inserir condutor terceiro:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar condutor terceiro' },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

async function atualizarCondutor(id: string, dados: any) {
  const { nome, cpf, rg, dataNascimento, categoria, numeroRegistro, dataVencimento } = dados

  // Validações
  if (!nome || !cpf) {
    return NextResponse.json(
      { error: 'Nome e CPF são obrigatórios' },
      { status: 400 }
    )
  }

  if (!validarCPF(cpf)) {
    return NextResponse.json(
      { error: 'CPF inválido' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('dados_cnh')
    .update({
      nome: nome.trim(),
      cpf: cpf.trim(),
      rg: rg?.trim() || null,
      data_nascimento: dataNascimento || null,
      categoria: categoria || null,
      numero_registro: numeroRegistro?.trim() || null,
      data_vencimento: dataVencimento || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('tipo_titular', 'terceiro')
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar condutor terceiro:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar condutor terceiro' },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

async function removerCondutor(id: string) {
  const { error } = await supabase
    .from('dados_cnh')
    .delete()
    .eq('id', id)
    .eq('tipo_titular', 'terceiro')

  if (error) {
    console.error('Erro ao remover condutor terceiro:', error)
    return NextResponse.json(
      { error: 'Erro ao remover condutor terceiro' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}

// Funções auxiliares para veículo
async function adicionarVeiculo(sinistroId: string, dados: any) {
  const { 
    placa, renavam, chassi, marca, modelo, 
    anoFabricacao, anoModelo, cor, combustivel, proprietario 
  } = dados

  // Validações
  if (!placa) {
    return NextResponse.json(
      { error: 'Placa é obrigatória' },
      { status: 400 }
    )
  }

  if (!validarPlaca(placa)) {
    return NextResponse.json(
      { error: 'Placa inválida' },
      { status: 400 }
    )
  }

  // Verificar se placa já existe para este sinistro
  const { data: existente } = await supabase
    .from('dados_crlv')
    .select('id')
    .eq('sinistro_id', sinistroId)
    .eq('placa', placa.toUpperCase())
    .eq('tipo_veiculo', 'terceiro')
    .single()

  if (existente) {
    return NextResponse.json(
      { error: 'Placa já cadastrada para este sinistro' },
      { status: 400 }
    )
  }

  // Inserir veículo terceiro
  const { data, error } = await supabase
    .from('dados_crlv')
    .insert({
      sinistro_id: sinistroId,
      tipo_veiculo: 'terceiro',
      placa: placa.toUpperCase().trim(),
      renavam: renavam?.trim() || null,
      chassi: chassi?.trim() || null,
      marca: marca?.trim() || null,
      modelo: modelo?.trim() || null,
      ano_fabricacao: anoFabricacao || null,
      ano_modelo: anoModelo || null,
      cor: cor?.trim() || null,
      combustivel: combustivel?.trim() || null,
      proprietario: proprietario?.trim() || null
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao inserir veículo terceiro:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar veículo terceiro' },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

async function atualizarVeiculo(id: string, dados: any) {
  const { 
    placa, renavam, chassi, marca, modelo, 
    anoFabricacao, anoModelo, cor, combustivel, proprietario 
  } = dados

  // Validações
  if (!placa) {
    return NextResponse.json(
      { error: 'Placa é obrigatória' },
      { status: 400 }
    )
  }

  if (!validarPlaca(placa)) {
    return NextResponse.json(
      { error: 'Placa inválida' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('dados_crlv')
    .update({
      placa: placa.toUpperCase().trim(),
      renavam: renavam?.trim() || null,
      chassi: chassi?.trim() || null,
      marca: marca?.trim() || null,
      modelo: modelo?.trim() || null,
      ano_fabricacao: anoFabricacao || null,
      ano_modelo: anoModelo || null,
      cor: cor?.trim() || null,
      combustivel: combustivel?.trim() || null,
      proprietario: proprietario?.trim() || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('tipo_veiculo', 'terceiro')
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar veículo terceiro:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar veículo terceiro' },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

async function removerVeiculo(id: string) {
  const { error } = await supabase
    .from('dados_crlv')
    .delete()
    .eq('id', id)
    .eq('tipo_veiculo', 'terceiro')

  if (error) {
    console.error('Erro ao remover veículo terceiro:', error)
    return NextResponse.json(
      { error: 'Erro ao remover veículo terceiro' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}