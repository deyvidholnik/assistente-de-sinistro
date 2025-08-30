import { PDFDocument } from 'pdf-lib'

/**
 * Converte a primeira página de um PDF em uma imagem base64
 * @param pdfFile - Arquivo PDF
 * @param cropRegion - Região para crop (opcional) {x, y, width, height} em percentuais (0-1)
 * @returns Promise<string> - Imagem em base64 (sem prefixo data:image/png;base64,)
 */
export async function convertPdfToImage(
  pdfFile: File, 
  cropRegion?: { x: number; y: number; width: number; height: number }
): Promise<string> {
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
    const originalViewport = page.getViewport({ scale })
    
    // Calcula dimensões do crop se especificado
    let finalViewport = originalViewport
    let cropX = 0
    let cropY = 0
    let cropWidth = originalViewport.width
    let cropHeight = originalViewport.height
    
    if (cropRegion) {
      cropX = originalViewport.width * cropRegion.x
      cropY = originalViewport.height * cropRegion.y
      cropWidth = originalViewport.width * cropRegion.width
      cropHeight = originalViewport.height * cropRegion.height
      
      canvas.width = cropWidth
      canvas.height = cropHeight
      
      // Cria um viewport cropado
      finalViewport = originalViewport
    } else {
      canvas.width = originalViewport.width
      canvas.height = originalViewport.height
    }
    
    const renderContext = {
      canvasContext: context,
      viewport: finalViewport,
      canvas: canvas,
      // Aplica transformação para crop se necessário
      transform: cropRegion ? [1, 0, 0, 1, -cropX, -cropY] : undefined
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
 * Calcula threshold adaptativo usando método Otsu
 * @param imageData - Dados da imagem
 * @returns Valor do threshold ideal
 */
function calculateOtsuThreshold(imageData: ImageData): number {
  const data = imageData.data
  const histogram = new Array(256).fill(0)
  
  // Calcula histograma
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    histogram[gray]++
  }
  
  const total = imageData.width * imageData.height
  let sum = 0
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i]
  }
  
  let sumB = 0
  let wB = 0
  let wF = 0
  let varMax = 0
  let threshold = 0
  
  for (let i = 0; i < 256; i++) {
    wB += histogram[i]
    if (wB === 0) continue
    
    wF = total - wB
    if (wF === 0) break
    
    sumB += i * histogram[i]
    
    const mB = sumB / wB
    const mF = (sum - sumB) / wF
    
    const varBetween = wB * wF * (mB - mF) * (mB - mF)
    
    if (varBetween > varMax) {
      varMax = varBetween
      threshold = i
    }
  }
  
  return threshold
}

/**
 * Aplica super resolução usando interpolação bicúbica
 * @param canvas - Canvas com a imagem
 * @param scaleFactor - Fator de escala (2x, 3x, etc)
 * @returns Canvas com imagem ampliada
 */
function applySuperResolution(canvas: HTMLCanvasElement, scaleFactor: number): HTMLCanvasElement {
  const originalWidth = canvas.width
  const originalHeight = canvas.height
  const newWidth = originalWidth * scaleFactor
  const newHeight = originalHeight * scaleFactor
  
  const newCanvas = document.createElement('canvas')
  const newCtx = newCanvas.getContext('2d')!
  
  newCanvas.width = newWidth
  newCanvas.height = newHeight
  
  // Usa interpolação suave do canvas
  newCtx.imageSmoothingEnabled = true
  newCtx.imageSmoothingQuality = 'high'
  
  newCtx.drawImage(canvas, 0, 0, originalWidth, originalHeight, 0, 0, newWidth, newHeight)
  
  return newCanvas
}

/**
 * Pré-processamento agressivo específico para CNH (texto pequeno)
 * @param base64Image - Imagem em base64
 * @returns Promise<string> - Imagem processada em base64
 */
export async function preprocessImageForCNHOCR(base64Image: string): Promise<string> {
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
        
        // 1. Aplica super resolução (3x para texto pequeno)
        const superResCanvas = applySuperResolution(canvas, 3)
        const superResCtx = superResCanvas.getContext('2d')!
        
        // 2. Obtém os dados da imagem ampliada
        const imageData = superResCtx.getImageData(0, 0, superResCanvas.width, superResCanvas.height)
        const data = imageData.data
        
        // 3. Calcula threshold adaptativo
        const threshold = calculateOtsuThreshold(imageData)
        
        // 4. Aplica pré-processamento agressivo
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          
          // Calcula luminância
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b
          
          // Contraste muito agressivo para texto pequeno
          const contrast = 3.0
          const enhanced = ((luminance - 128) * contrast) + 128
          
          // Aplica binarização com threshold adaptativo
          const binarized = enhanced > threshold ? 255 : 0
          
          // Define pixel como preto ou branco
          data[i] = binarized     // R
          data[i + 1] = binarized // G
          data[i + 2] = binarized // B
          // Alpha permanece igual
        }
        
        // 5. Aplica os dados processados de volta
        superResCtx.putImageData(imageData, 0, 0)
        
        // 6. Aplica sharpening agressivo para texto
        const sharpened = applyAggressiveSharpening(superResCtx, superResCanvas.width, superResCanvas.height)
        
        // 7. Converte para base64
        const processedDataUrl = sharpened.toDataURL('image/png', 1.0)
        const processedBase64 = processedDataUrl.split(',')[1]
        
        resolve(processedBase64)
      }
      
      img.onerror = () => reject(new Error('Erro ao carregar imagem para pré-processamento CNH'))
      img.src = `data:image/png;base64,${base64Image}`
    })
  } catch (error) {
    console.error('Erro no pré-processamento CNH:', error)
    // Fallback: usa pré-processamento normal
    return preprocessImageForOCR(base64Image)
  }
}

/**
 * Pré-processa uma imagem base64 para melhorar OCR (versão genérica)
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
 * Aplica sharpening agressivo otimizado para texto pequeno
 * @param ctx - Contexto do canvas
 * @param width - Largura da imagem
 * @param height - Altura da imagem
 * @returns Canvas com nitidez aplicada
 */
function applyAggressiveSharpening(ctx: CanvasRenderingContext2D, width: number, height: number): HTMLCanvasElement {
  const canvas = ctx.canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const result = new Uint8ClampedArray(data)
  
  // Kernel de sharpening agressivo para texto pequeno
  const kernel = [
    0, -1, 0,
    -1, 9, -1,  // Centro mais intenso (9 ao invés de 5)
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
 * Aplica filtro de nitidez na imagem (versão suave)
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
 * Cria região de crop para CNH (coordenadas em percentuais)
 * @param attempt - Tentativa (1 = inicial, 2 = ampliado)
 * @returns Objeto com coordenadas de crop
 */
export function getCNHCropRegion(attempt: number): { x: number; y: number; width: number; height: number } {
  switch (attempt) {
    case 1:
      // Crop inicial: 50% x 50% do canto superior esquerdo
      return { x: 0, y: 0, width: 0.5, height: 0.5 }
    case 2:
      // Crop ampliado: 65% x 65% (aumento de 30%)
      return { x: 0, y: 0, width: 0.65, height: 0.65 }
    default:
      // Sem crop (imagem completa)
      return { x: 0, y: 0, width: 1, height: 1 }
  }
}

/**
 * Cria região de crop para CRLV (coordenadas em percentuais)
 * @param attempt - Tentativa (1 = inicial, 2 = ampliado)
 * @returns Objeto com coordenadas de crop
 */
export function getCRLVCropRegion(attempt: number): { x: number; y: number; width: number; height: number } {
  switch (attempt) {
    case 1:
      // Crop inicial: largura toda x 50% altura (metade superior)
      return { x: 0, y: 0, width: 1.0, height: 0.5 }
    case 2:
      // Crop ampliado: largura toda x 70% altura
      return { x: 0, y: 0, width: 1.0, height: 0.7 }
    default:
      // Sem crop (imagem completa)
      return { x: 0, y: 0, width: 1, height: 1 }
  }
}

/**
 * Converte PDF para imagem com crop específico para CNH
 * @param pdfFile - Arquivo PDF
 * @param attempt - Tentativa de crop (1, 2, ou 3 para imagem completa)
 * @returns Promise<string> - Imagem em base64
 */
export async function convertPdfToImageForCNH(pdfFile: File, attempt: number): Promise<string> {
  const cropRegion = attempt <= 2 ? getCNHCropRegion(attempt) : undefined
  return convertPdfToImage(pdfFile, cropRegion)
}

/**
 * Converte PDF para imagem com crop específico para CRLV
 * @param pdfFile - Arquivo PDF
 * @param attempt - Tentativa de crop (1, 2, ou 3 para imagem completa)
 * @returns Promise<string> - Imagem em base64
 */
export async function convertPdfToImageForCRLV(pdfFile: File, attempt: number): Promise<string> {
  const cropRegion = attempt <= 2 ? getCRLVCropRegion(attempt) : undefined
  return convertPdfToImage(pdfFile, cropRegion)
}

/**
 * Verifica se um arquivo é PDF
 * @param file - Arquivo a ser verificado
 * @returns boolean
 */
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}