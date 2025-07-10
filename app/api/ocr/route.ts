import { NextResponse } from "next/server"

// Modelo otimizado para OCR (rápido e econômico)
const OCR_MODEL = "gpt-4o-mini"

/**
 * Gera o prompt conforme o tipo de documento
 */
function getPrompt(type: "cnh" | "crlv") {
  if (type === "cnh") {
    return `
      Analise a imagem de uma CNH brasileira e devolva JSON no formato:
      {
        "nome": "",
        "cpf": "",
        "rg": "",
        "dataNascimento": "YYYY-MM-DD",
        "categoria": "",
        "numeroRegistro": "",
        "dataVencimento": "YYYY-MM-DD"
      }
      Preencha com string vazia caso algum campo não exista.
    `
  }
  return `
    Analise a imagem de um CRLV brasileiro e devolva JSON no formato:
    {
      "placa": "",
      "renavam": "",
      "chassi": "",
      "marca": "",
      "modelo": "",
      "anoFabricacao": "",
      "anoModelo": "",
      "cor": "",
      "combustivel": "",
      "proprietario": ""
    }
    Preencha com string vazia caso algum campo não exista.
  `
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, message: "OPENAI_API_KEY não configurada." }, { status: 200 })
    }

    const { base64Image, type } = await req.json()
    if (!base64Image || (type !== "cnh" && type !== "crlv")) {
      return NextResponse.json({ success: false, message: "Requisição inválida." }, { status: 400 })
    }

    // Chamada REST direta à OpenAI
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OCR_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: "Você é um assistente de OCR que devolve SOMENTE JSON válido e nada mais.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: getPrompt(type) },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      }),
    })

    if (!openAiResponse.ok) {
      const errTxt = await openAiResponse.text()
      return NextResponse.json(
        {
          success: false,
          message: `Erro OpenAI (${openAiResponse.status}): ${errTxt.slice(0, 200)}`,
        },
        { status: 200 },
      )
    }

    const data = await openAiResponse.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) {
      throw new Error("Resposta vazia da OpenAI.")
    }

    const extractedData = JSON.parse(content)
    return NextResponse.json({ success: true, extractedData })
  } catch (err: any) {
    console.error("❌ [OCR]", err)
    return NextResponse.json({ success: false, message: err.message || "Falha inesperada no OCR." }, { status: 200 })
  }
}
