import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Definir passos padrão por tipo de status
const PASSOS_POR_STATUS = {
  'em_analise': [
    { id: 1, nome: 'Documentação Recebida', descricao: 'Documentos foram recebidos e catalogados', ordem: 1 },
    { id: 2, nome: 'Análise Inicial', descricao: 'Primeira análise dos documentos enviados', ordem: 2 },
    { id: 3, nome: 'Verificação de Dados', descricao: 'Verificação da veracidade dos dados informados', ordem: 3 },
    { id: 4, nome: 'Análise Técnica', descricao: 'Análise técnica detalhada do sinistro', ordem: 4 },
    { id: 5, nome: 'Avaliação Concluída', descricao: 'Análise completa e decisão tomada', ordem: 5 }
  ],
  'aprovado': [
    { id: 4, nome: 'Orçamento Solicitado', descricao: 'Solicitação de orçamento para reparo', ordem: 1 },
    { id: 5, nome: 'Orçamento Aprovado', descricao: 'Orçamento foi aprovado pela seguradora', ordem: 2 },
    { id: 6, nome: 'Reparo Autorizado', descricao: 'Autorização para início do reparo', ordem: 3 },
    { id: 7, nome: 'Reparo em Andamento', descricao: 'Reparo do veículo está sendo realizado', ordem: 4 },
    { id: 8, nome: 'Reparo Concluído', descricao: 'Reparo do veículo foi finalizado', ordem: 5 },
    { id: 9, nome: 'Vistoria Final', descricao: 'Vistoria final do reparo realizado', ordem: 6 },
    { id: 10, nome: 'Processo Finalizado', descricao: 'Sinistro totalmente processado e concluído', ordem: 7 }
  ],
  'rejeitado': [
    { id: 1, nome: 'Análise Realizada', descricao: 'Análise completa dos documentos foi realizada', ordem: 1 },
    { id: 2, nome: 'Motivo Identificado', descricao: 'Motivo da rejeição foi identificado e documentado', ordem: 2 },
    { id: 3, nome: 'Comunicação Preparada', descricao: 'Comunicação ao segurado foi preparada', ordem: 3 },
    { id: 4, nome: 'Cliente Notificado', descricao: 'Cliente foi formalmente notificado da decisão', ordem: 4 },
    { id: 5, nome: 'Processo Arquivado', descricao: 'Processo foi arquivado conforme procedimentos', ordem: 5 }
  ]
}

// Função para obter a data atual no fuso de Brasília
function obterDataAtualBrasilia(): string {
  const agora = new Date()
  
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
  
  const [dataParte, horaParte] = brasiliaString.split(', ')
  const [dia, mes, ano] = dataParte.split('/')
  const [hora, min, seg] = horaParte.split(':')
  
  const dataFormatada = `${ano}-${mes}-${dia}T${hora}:${min}:${seg}.000-03:00`
  
  return dataFormatada
}

// Criar andamento inicial baseado no status do sinistro
function criarAndamentoInicial(statusSinistro: string) {
  const passos = PASSOS_POR_STATUS[statusSinistro as keyof typeof PASSOS_POR_STATUS] || []
  return passos.map(passo => ({
    id: passo.id,
    nome: passo.nome,
    descricao: passo.descricao,
    ordem: passo.ordem,
    status: 'pendente',
    data_inicio: null,
    data_conclusao: null,
    observacoes: null,
    usuario_responsavel: null
  }))
}

// GET - Buscar andamento de um sinistro
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sinistroId = searchParams.get('sinistroId')

    if (!sinistroId) {
      return NextResponse.json({ error: 'ID do sinistro é obrigatório' }, { status: 400 })
    }

    // Buscar sinistro com andamento
    const { data, error } = await supabase
      .from('sinistros')
      .select('id, status, andamento')
      .eq('id', sinistroId)
      .single()

    if (error) {
      console.error('Erro ao buscar sinistro:', error)
      return NextResponse.json({ error: 'Erro ao buscar sinistro' }, { status: 500 })
    }

    // Se não tem andamento e tem status que precisa de andamento, criar andamento inicial
    let andamento = data.andamento
    if (!andamento && ['em_analise', 'aprovado', 'rejeitado'].includes(data.status)) {
      andamento = criarAndamentoInicial(data.status)
      
      // Salvar andamento inicial no banco
      const { error: updateError } = await supabase
        .from('sinistros')
        .update({ andamento })
        .eq('id', sinistroId)

      if (updateError) {
        console.error('Erro ao salvar andamento inicial:', updateError)
      }
    }

    return NextResponse.json({ andamento: andamento || [] })

  } catch (error) {
    console.error('Erro geral na API andamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Atualizar status de um passo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sinistroId, passoId, status, observacoes, usuarioResponsavel } = body

    if (!sinistroId || !passoId || !status) {
      return NextResponse.json({ 
        error: 'Sinistro ID, Passo ID e Status são obrigatórios' 
      }, { status: 400 })
    }

    const dataAtualBrasilia = obterDataAtualBrasilia()

    // Buscar andamento atual
    const { data: sinistroData, error: fetchError } = await supabase
      .from('sinistros')
      .select('andamento, status')
      .eq('id', sinistroId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar sinistro:', fetchError)
      return NextResponse.json({ error: 'Erro ao buscar sinistro' }, { status: 500 })
    }

    let andamento = sinistroData.andamento || criarAndamentoInicial(sinistroData.status)

    // Encontrar e atualizar o passo
    const passoIndex = andamento.findIndex((p: any) => p.id === parseInt(passoId))
    if (passoIndex === -1) {
      return NextResponse.json({ error: 'Passo não encontrado' }, { status: 404 })
    }

    // Atualizar o passo
    andamento[passoIndex] = {
      ...andamento[passoIndex],
      status,
      observacoes: observacoes || null,
      usuario_responsavel: usuarioResponsavel || 'Gerente'
    }

    // Definir datas baseadas no status
    if (status === 'em_andamento' && !andamento[passoIndex].data_inicio) {
      andamento[passoIndex].data_inicio = dataAtualBrasilia
    } else if (status === 'concluido') {
      andamento[passoIndex].data_conclusao = dataAtualBrasilia
    }

    // Verificar se todos os passos foram concluídos
    const todosConcluidos = andamento.every((p: any) => p.status === 'concluido')
    let novoStatusSinistro = sinistroData.status

    if (todosConcluidos && sinistroData.status !== 'concluido') {
      novoStatusSinistro = 'concluido'
    }

    // Atualizar no banco
    const updateData: any = { 
      andamento,
      data_atualizacao: dataAtualBrasilia
    }

    if (novoStatusSinistro !== sinistroData.status) {
      updateData.status = novoStatusSinistro
    }

    const { error: updateError } = await supabase
      .from('sinistros')
      .update(updateData)
      .eq('id', sinistroId)

    if (updateError) {
      console.error('Erro ao atualizar andamento:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar andamento' }, { status: 500 })
    }

    // Registrar log
    await supabase.from('log_atividades').insert([{
      sinistro_id: sinistroId,
      acao: 'PASSO_ATUALIZADO',
      descricao: `Passo "${andamento[passoIndex].nome}" atualizado para: ${status}${observacoes ? ` - ${observacoes}` : ''}`,
      usuario_nome: usuarioResponsavel || 'Gerente',
      created_at: dataAtualBrasilia
    }])

    // Se sinistro foi concluído automaticamente, registrar log
    if (novoStatusSinistro === 'concluido' && sinistroData.status !== 'concluido') {
      await supabase.from('log_atividades').insert([{
        sinistro_id: sinistroId,
        acao: 'SINISTRO_CONCLUIDO',
        descricao: 'Sinistro automaticamente marcado como concluído - todos os passos foram finalizados',
        status_novo: 'concluido',
        usuario_nome: 'Sistema',
        created_at: dataAtualBrasilia
      }])
    }

    return NextResponse.json({ success: true, message: 'Andamento atualizado com sucesso' })

  } catch (error) {
    console.error('Erro geral ao atualizar andamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar status do sinistro
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { sinistroId, novoStatus, observacoes } = body

    if (!sinistroId || !novoStatus) {
      return NextResponse.json({ 
        error: 'Sinistro ID e Novo Status são obrigatórios' 
      }, { status: 400 })
    }

    const dataAtualBrasilia = obterDataAtualBrasilia()

    // Se mudando para status que precisa andamento, criar andamento inicial
    let updateData: any = { 
      status: novoStatus,
      data_atualizacao: dataAtualBrasilia
    }

    if (['em_analise', 'aprovado', 'rejeitado'].includes(novoStatus)) {
      updateData.andamento = criarAndamentoInicial(novoStatus)
    }

    // Atualizar status do sinistro
    const { error } = await supabase
      .from('sinistros')
      .update(updateData)
      .eq('id', sinistroId)

    if (error) {
      console.error('Erro ao atualizar status do sinistro:', error)
      return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 })
    }

    // Registrar log
    await supabase.from('log_atividades').insert([{
      sinistro_id: sinistroId,
      acao: 'STATUS_ALTERADO',
      descricao: `Status alterado para: ${novoStatus}${observacoes ? ` - ${observacoes}` : ''}`,
      status_novo: novoStatus,
      usuario_nome: 'Gerente',
      created_at: dataAtualBrasilia
    }])

    return NextResponse.json({ success: true, message: 'Status atualizado com sucesso' })

  } catch (error) {
    console.error('Erro geral ao atualizar status:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PATCH - Adicionar novo passo personalizado
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { sinistroId, novoPasso } = body

    if (!sinistroId || !novoPasso || !novoPasso.nome || !novoPasso.descricao) {
      return NextResponse.json({ 
        error: 'Sinistro ID, nome e descrição do novo passo são obrigatórios' 
      }, { status: 400 })
    }

    const dataAtualBrasilia = obterDataAtualBrasilia()

    // Buscar andamento atual
    const { data: sinistroData, error: fetchError } = await supabase
      .from('sinistros')
      .select('andamento, status')
      .eq('id', sinistroId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar sinistro:', fetchError)
      return NextResponse.json({ error: 'Erro ao buscar sinistro' }, { status: 500 })
    }

    let andamento = sinistroData.andamento || criarAndamentoInicial(sinistroData.status)

    // Encontrar próximo ID disponível
    const nextId = Math.max(...andamento.map((p: any) => p.id)) + 1
    
    // Encontrar próxima ordem disponível
    const nextOrdem = Math.max(...andamento.map((p: any) => p.ordem)) + 1

    // Criar novo passo
    const novoPassoCompleto = {
      id: nextId,
      nome: novoPasso.nome,
      descricao: novoPasso.descricao,
      ordem: nextOrdem,
      status: 'pendente',
      data_inicio: null,
      data_conclusao: null,
      observacoes: null,
      usuario_responsavel: null,
      personalizado: true
    }

    // Adicionar ao andamento
    andamento.push(novoPassoCompleto)

    // Atualizar no banco
    const { error: updateError } = await supabase
      .from('sinistros')
      .update({ 
        andamento,
        data_atualizacao: dataAtualBrasilia
      })
      .eq('id', sinistroId)

    if (updateError) {
      console.error('Erro ao adicionar novo passo:', updateError)
      return NextResponse.json({ error: 'Erro ao adicionar novo passo' }, { status: 500 })
    }

    // Registrar log
    await supabase.from('log_atividades').insert([{
      sinistro_id: sinistroId,
      acao: 'PASSO_ADICIONADO',
      descricao: `Novo passo personalizado adicionado: "${novoPasso.nome}"`,
      usuario_nome: 'Gerente',
      created_at: dataAtualBrasilia
    }])

    return NextResponse.json({ 
      success: true, 
      message: 'Novo passo adicionado com sucesso',
      novoPasso: novoPassoCompleto
    })

  } catch (error) {
    console.error('Erro geral ao adicionar novo passo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Remover passo personalizado
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sinistroId = searchParams.get('sinistroId')
    const passoId = searchParams.get('passoId')

    if (!sinistroId || !passoId) {
      return NextResponse.json({ 
        error: 'Sinistro ID e Passo ID são obrigatórios' 
      }, { status: 400 })
    }

    const dataAtualBrasilia = obterDataAtualBrasilia()

    // Buscar andamento atual
    const { data: sinistroData, error: fetchError } = await supabase
      .from('sinistros')
      .select('andamento')
      .eq('id', sinistroId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar sinistro:', fetchError)
      return NextResponse.json({ error: 'Erro ao buscar sinistro' }, { status: 500 })
    }

    let andamento = sinistroData.andamento || []

    // Encontrar o passo a ser removido
    const passoIndex = andamento.findIndex((p: any) => p.id === parseInt(passoId))
    if (passoIndex === -1) {
      return NextResponse.json({ error: 'Passo não encontrado' }, { status: 404 })
    }

    const passo = andamento[passoIndex]

    // Verificar se é um passo personalizado (pode ser removido)
    if (!passo.personalizado) {
      return NextResponse.json({ 
        error: 'Apenas passos personalizados podem ser removidos' 
      }, { status: 400 })
    }

    // Remover o passo
    andamento.splice(passoIndex, 1)

    // Atualizar no banco
    const { error: updateError } = await supabase
      .from('sinistros')
      .update({ 
        andamento,
        data_atualizacao: dataAtualBrasilia
      })
      .eq('id', sinistroId)

    if (updateError) {
      console.error('Erro ao remover passo:', updateError)
      return NextResponse.json({ error: 'Erro ao remover passo' }, { status: 500 })
    }

    // Registrar log
    await supabase.from('log_atividades').insert([{
      sinistro_id: sinistroId,
      acao: 'PASSO_REMOVIDO',
      descricao: `Passo personalizado removido: "${passo.nome}"`,
      usuario_nome: 'Gerente',
      created_at: dataAtualBrasilia
    }])

    return NextResponse.json({ 
      success: true, 
      message: 'Passo removido com sucesso'
    })

  } catch (error) {
    console.error('Erro geral ao remover passo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 