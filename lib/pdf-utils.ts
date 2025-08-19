import { PDFDocument } from 'pdf-lib'

/**
 * Converte a primeira página de um PDF em uma imagem base64
 * @param pdfFile - Arquivo PDF
 * @returns Promise<string> - Imagem em base64 (sem prefixo data:image/png;base64,)
 */
export async function convertPdfToImage(pdfFile: File): Promise<string> {
  try {
    // Lê o arquivo PDF como ArrayBuffer
    const pdfBytes = await pdfFile.arrayBuffer()
    
    // Carrega o documento PDF
    const pdfDoc = await PDFDocument.load(pdfBytes)
    
    // Pega a primeira página
    const pages = pdfDoc.getPages()
    if (pages.length === 0) {
      throw new Error('PDF não contém páginas')
    }
    
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()
    
    // Cria um canvas para renderizar a página
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (!context) {
      throw new Error('Não foi possível criar contexto do canvas')
    }
    
    // Define a resolução do canvas (4x para melhor qualidade OCR)
    const scale = 4
    canvas.width = width * scale
    canvas.height = height * scale
    
    // Para renderização via pdf-lib, precisamos usar uma abordagem diferente
    // Vamos usar a biblioteca pdfjs-dist para renderização
    const pdfjs = await import('pdfjs-dist')
    
    // Configura o worker - usa arquivo local para evitar CORS
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'
    
    // Carrega o documento com pdf.js
    const loadingTask = pdfjs.getDocument({ data: pdfBytes })
    const pdf = await loadingTask.promise
    
    // Renderiza a primeira página
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale })
    
    canvas.width = viewport.width
    canvas.height = viewport.height
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }
    
    await page.render(renderContext).promise
    
    // Converte canvas para base64 com qualidade máxima
    const imageDataUrl = canvas.toDataURL('image/png', 1.0)
    
    // Remove o prefixo 'data:image/png;base64,'
    const base64 = imageDataUrl.split(',')[1]
    
    return base64
  } catch (error) {
    console.error('Erro ao converter PDF para imagem:', error)
    throw new Error(`Falha na conversão do PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

/**
 * Pré-processa uma imagem base64 para melhorar OCR
 * @param base64Image - Imagem em base64
 * @returns Promise<string> - Imagem processada em base64
 */
export async function preprocessImageForOCR(base64Image: string): Promise<string> {
  try {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Não foi possível criar contexto do canvas'))
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        
        // Desenha a imagem original
        ctx.drawImage(img, 0, 0)
        
        // Obtém os dados da imagem
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // Aplica pré-processamento
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          
          // Calcula luminância
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b
          
          // Aumenta contraste
          const contrast = 1.5
          const enhanced = ((luminance - 128) * contrast) + 128
          
          // Aplica binarização com threshold adaptativo
          const threshold = 150
          const binarized = enhanced > threshold ? 255 : 0
          
          // Define pixel como preto ou branco
          data[i] = binarized     // R
          data[i + 1] = binarized // G
          data[i + 2] = binarized // B
          // Alpha permanece igual (data[i + 3])
        }
        
        // Aplica os dados processados de volta ao canvas
        ctx.putImageData(imageData, 0, 0)
        
        // Aplica nitidez (sharpening)
        const sharpened = applySharpening(ctx, canvas.width, canvas.height)
        
        // Converte para base64
        const processedDataUrl = sharpened.toDataURL('image/png', 1.0)
        const processedBase64 = processedDataUrl.split(',')[1]
        
        resolve(processedBase64)
      }
      
      img.onerror = () => reject(new Error('Erro ao carregar imagem para pré-processamento'))
      img.src = `data:image/png;base64,${base64Image}`
    })
  } catch (error) {
    console.error('Erro no pré-processamento:', error)
    // Retorna imagem original em caso de erro
    return base64Image
  }
}

/**
 * Aplica filtro de nitidez na imagem
 * @param ctx - Contexto do canvas
 * @param width - Largura da imagem
 * @param height - Altura da imagem
 * @returns Canvas com nitidez aplicada
 */
function applySharpening(ctx: CanvasRenderingContext2D, width: number, height: number): HTMLCanvasElement {
  const canvas = ctx.canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const result = new Uint8ClampedArray(data)
  
  // Kernel de nitidez
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ]
  
  // Aplica o kernel de convolução
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB apenas
        let sum = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c
            const kernelIdx = (ky + 1) * 3 + (kx + 1)
            sum += data[idx] * kernel[kernelIdx]
          }
        }
        result[(y * width + x) * 4 + c] = Math.max(0, Math.min(255, sum))
      }
    }
  }
  
  const resultImageData = new ImageData(result, width, height)
  ctx.putImageData(resultImageData, 0, 0)
  
  return canvas
}

/**
 * Verifica se um arquivo é PDF
 * @param file - Arquivo a ser verificado
 * @returns boolean
 */
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}