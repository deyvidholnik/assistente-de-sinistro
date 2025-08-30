"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Trash2, Eye, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { convertPdfToImage, isPdfFile, getCNHCropRegion, getCRLVCropRegion } from "@/lib/pdf-utils"
import type { DocumentosData } from "@/types"

interface FilePreviewProps {
  files: File[]
  field?: keyof DocumentosData
  stepId?: number
  onRemove: (index: number) => void
  documentType?: "cnh" | "crlv" // Adicionado para identificar tipo
}

interface PreviewData {
  file: File
  previewUrl: string
  isPdf: boolean
  isLoading: boolean
  error?: string
}

export function FilePreview({ files, onRemove, documentType }: FilePreviewProps) {
  const [previews, setPreviews] = useState<PreviewData[]>([])
  const [selectedPreview, setSelectedPreview] = useState<PreviewData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Gerar pré-visualizações
  useEffect(() => {
    const generatePreviews = async () => {
      const newPreviews: PreviewData[] = []

      for (const file of files) {
        const previewData: PreviewData = {
          file,
          previewUrl: '',
          isPdf: isPdfFile(file),
          isLoading: true
        }

        if (isPdfFile(file)) {
          try {
            let base64Image: string
            
            if (documentType === 'cnh') {
              // Para CNH PDF, mostra região cropada (tentativa 1)
              const cropRegion = getCNHCropRegion(1)
              base64Image = await convertPdfToImage(file, cropRegion)
            } else if (documentType === 'crlv') {
              // Para CRLV PDF, mostra região cropada (tentativa 1)
              const cropRegion = getCRLVCropRegion(1)
              base64Image = await convertPdfToImage(file, cropRegion)
            } else {
              // Para outros PDFs, mostra imagem completa
              base64Image = await convertPdfToImage(file)
            }
            
            previewData.previewUrl = `data:image/png;base64,${base64Image}`
            previewData.isLoading = false
          } catch (error) {
            previewData.error = 'Erro ao converter PDF'
            previewData.isLoading = false
          }
        } else if (file.type.startsWith('image/')) {
          previewData.previewUrl = URL.createObjectURL(file)
          previewData.isLoading = false
        } else {
          previewData.isLoading = false
        }

        newPreviews.push(previewData)
      }

      setPreviews(newPreviews)
    }

    if (files.length > 0) {
      generatePreviews()
    } else {
      setPreviews([])
    }

    // Cleanup URLs
    return () => {
      previews.forEach(preview => {
        if (preview.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(preview.previewUrl)
        }
      })
    }
  }, [files])

  const openModal = (preview: PreviewData) => {
    setSelectedPreview(preview)
    setModalOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mt-3 sm:mt-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group">
            <div 
              className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => !preview.isLoading && preview.previewUrl && openModal(preview)}
            >
              {preview.isLoading ? (
                <div className="text-center p-2">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                  <p className="text-xs text-gray-500">Processando...</p>
                </div>
              ) : preview.error ? (
                <div className="text-center p-2">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-xs text-red-500 truncate">{preview.error}</p>
                </div>
              ) : preview.previewUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={preview.previewUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {preview.isPdf && (
                    <div className="absolute top-1 left-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded">
                      PDF
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="text-center p-2">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 truncate">{preview.file.name}</p>
                </div>
              )}
            </div>
            
            <Button
              onClick={() => onRemove(index)}
              size="sm"
              variant="destructive"
              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </Button>
            
            <div className="mt-1">
              <p className="text-xs text-gray-600 truncate leading-tight">{preview.file.name}</p>
              {preview.isPdf && (
                <p className="text-xs text-blue-600 font-medium">PDF → Imagem para OCR</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Visualização */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {selectedPreview?.file.name}
              {selectedPreview?.isPdf && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                  PDF convertido para OCR
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center bg-gray-50 rounded-lg min-h-[400px] max-h-[70vh] overflow-auto">
            {selectedPreview?.previewUrl ? (
              <img
                src={selectedPreview.previewUrl}
                alt="Preview em tamanho grande"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center p-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Não foi possível gerar pré-visualização</p>
              </div>
            )}
          </div>
          {selectedPreview?.isPdf && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>
                  {(documentType === 'cnh' || documentType === 'crlv')
                    ? 'Esta é a região cropada que será enviada para o OCR (canto superior esquerdo).' 
                    : 'Esta é a imagem que será enviada para o OCR.'
                  }
                </strong> Se os dados extraídos estiverem incorretos, 
                verifique se o PDF original tem boa qualidade e texto legível.
                {(documentType === 'cnh' || documentType === 'crlv') && (
                  <span> O sistema tentará automaticamente regiões maiores se necessário.</span>
                )}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
