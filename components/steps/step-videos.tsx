'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Video, Upload, X, AlertCircle, CheckCircle, Play, SkipForward } from 'lucide-react'
import { useForm } from '@/context/form-context'

export function StepVideos() {
  const { 
    tipoSinistro, 
    tipoAtendimento,
    isDocumentingThirdParty,
    videosProprio = [],
    videosTerceiro = [],
    handleVideoUpload,
    removeVideoFile 
  } = useForm()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const tipo = isDocumentingThirdParty ? 'terceiro' : 'proprio'
  const videos = isDocumentingThirdParty ? videosTerceiro : videosProprio
  
  const getInstrucoes = () => {
    if (tipoSinistro === 'pequenos_reparos') {
      return {
        titulo: 'Vídeo do Reparo',
        subtitulo: 'Grave um vídeo mostrando o dano a ser reparado',
        instrucoes: [
          'Mostre o dano em detalhes de diferentes ângulos',
          'Narre o que está sendo mostrado no vídeo',
          'Mantenha o vídeo curto e objetivo (máximo 2 minutos)',
          'Use boa iluminação para melhor visualização'
        ],
        dicas: 'Foque na área danificada e explique o problema'
      }
    }
    
    if (tipoAtendimento === 'assistencia') {
      return {
        titulo: 'Vídeo da Situação',
        subtitulo: 'Documente a situação que necessita assistência',
        instrucoes: [
          'Mostre o veículo e o problema atual',
          'Capture o local onde você está',
          'Grave por no máximo 2 minutos',
          'Narre a situação enquanto grava'
        ],
        dicas: 'Mostre claramente qual assistência você precisa'
      }
    }
    
    if (isDocumentingThirdParty) {
      return {
        titulo: 'Vídeo do Veículo Terceiro',
        subtitulo: 'Documente os danos do outro veículo envolvido',
        instrucoes: [
          'Mostre a placa e os danos do outro veículo',
          'Capture diferentes ângulos do veículo',
          'Grave por no máximo 2 minutos',
          'Mantenha distância segura ao gravar'
        ],
        dicas: 'Documente todos os danos visíveis do terceiro'
      }
    }
    
    return {
      titulo: 'Vídeo do Seu Veículo',
      subtitulo: 'Grave a situação geral do sinistro',
      instrucoes: [
        'Mostre todos os danos do seu veículo',
        'Capture o contexto do local do sinistro',
        'Grave por no máximo 2 minutos',
        'Narre os detalhes importantes'
      ],
      dicas: 'Documente a cena completa do acidente'
    }
  }

  const instrucoes = getInstrucoes()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validações
    const maxSize = 100 * 1024 * 1024 // 100MB
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Formato não suportado. Use MP4, WebM, MOV ou AVI.')
      return
    }
    
    if (file.size > maxSize) {
      setUploadError('Vídeo muito grande. Máximo permitido: 100MB')
      return
    }
    
    setIsUploading(true)
    setUploadError(null)
    
    try {
      await handleVideoUpload(files, tipo)
    } catch (error) {
      setUploadError('Erro ao processar vídeo. Tente novamente.')
    } finally {
      setIsUploading(false)
      // Limpar o input
      e.target.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Header */}
      <div className='text-center mb-4'>
        <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3'>
          <Video className='w-8 h-8 text-purple-600' />
        </div>
        <h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-2'>{instrucoes.titulo}</h2>
        <p className='text-sm sm:text-base text-gray-600'>{instrucoes.subtitulo}</p>
        
        {/* Badge opcional */}
        <div className='mt-3'>
          <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
            <AlertCircle className='w-3 h-3 mr-1' />
            Passo Opcional
          </span>
        </div>
      </div>

      {/* Instruções */}
      <div className='bg-purple-50 border-purple-200 rounded-lg p-4 sm:p-6 border mx-2 sm:mx-0'>
        <h3 className='font-semibold text-purple-800 mb-3 flex items-center text-sm sm:text-base'>
          <Video className='w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0' />
          Como Gravar o Vídeo
        </h3>
        
        <ul className='space-y-2 text-xs sm:text-sm text-purple-700'>
          {instrucoes.instrucoes.map((instrucao, index) => (
            <li key={index} className='flex items-start leading-relaxed'>
              <span className='text-purple-600 mr-2 flex-shrink-0 mt-0.5'>✓</span>
              <span>{instrucao}</span>
            </li>
          ))}
        </ul>
        
        <div className='mt-4 p-3 bg-white rounded border border-purple-200'>
          <p className='text-xs sm:text-sm text-purple-700'>
            <strong>Dica:</strong> {instrucoes.dicas}
          </p>
        </div>
      </div>

      {/* Área de Upload */}
      {videos.length === 0 ? (
        <div className='flex flex-col items-center justify-center space-y-4'>
          <input
            id='video-upload'
            type='file'
            accept='video/mp4,video/webm,video/quicktime,video/x-msvideo'
            capture='environment'
            className='hidden'
            onChange={handleFileChange}
            disabled={isUploading}
          />
          
          <Button
            type='button'
            onClick={() => !isUploading && document.getElementById('video-upload')?.click()}
            className='w-full max-w-sm h-12 sm:h-14 bg-purple-600 hover:bg-purple-700'
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                Processando vídeo...
              </>
            ) : (
              <>
                <Upload className='w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0' />
                <div className='text-center'>
                  <div className='font-medium text-xs sm:text-sm'>Gravar/Enviar Vídeo</div>
                  <div className='text-xs opacity-90'>Abrir Câmera ou Galeria</div>
                </div>
              </>
            )}
          </Button>
          
          {/* Botão Pular - removido pois a navegação é controlada externamente */}
        </div>
      ) : (
        <div className='space-y-3'>
          {/* Preview do vídeo */}
          {videos.map((video, index) => (
            <div key={index} className='bg-white rounded-lg border border-gray-200 p-4'>
              <div className='flex items-start justify-between'>
                <div className='flex items-start space-x-3'>
                  <div className='w-10 h-10 bg-purple-100 rounded flex items-center justify-center flex-shrink-0'>
                    <Play className='w-5 h-5 text-purple-600' />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-900'>{video.name}</p>
                    <p className='text-xs text-gray-500'>{formatFileSize(video.size)}</p>
                  </div>
                </div>
                
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => removeVideoFile(index, tipo)}
                  className='text-red-600 hover:text-red-700 hover:bg-red-50'
                >
                  <X className='w-4 h-4' />
                </Button>
              </div>
              
              {/* Preview do vídeo */}
              <div className='mt-3'>
                <video 
                  controls 
                  className='w-full rounded-lg bg-black'
                  style={{ maxHeight: '300px' }}
                >
                  <source src={URL.createObjectURL(video)} type={video.type} />
                  Seu navegador não suporta vídeos.
                </video>
              </div>
            </div>
          ))}
          
          {/* Opção de adicionar outro vídeo (máximo 3) */}
          {videos.length < 3 && (
            <div className='flex justify-center mt-4'>
              <input
                id='video-upload-additional'
                type='file'
                accept='video/mp4,video/webm,video/quicktime,video/x-msvideo'
                capture='environment'
                className='hidden'
                onChange={handleFileChange}
                disabled={isUploading}
              />
              
              <Button
                type='button'
                variant='outline'
                onClick={() => !isUploading && document.getElementById('video-upload-additional')?.click()}
                disabled={isUploading}
                size='sm'
              >
                <Upload className='w-4 h-4 mr-2' />
                Adicionar outro vídeo
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Mensagem de erro */}
      {uploadError && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-3 mx-2 sm:mx-0'>
          <div className='flex items-center'>
            <AlertCircle className='w-4 h-4 text-red-600 mr-2 flex-shrink-0' />
            <p className='text-sm text-red-700'>{uploadError}</p>
          </div>
        </div>
      )}

      {/* Mensagem de sucesso */}
      {videos.length > 0 && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-3 mx-2 sm:mx-0'>
          <div className='flex items-center'>
            <CheckCircle className='w-4 h-4 text-green-600 mr-2 flex-shrink-0' />
            <p className='text-sm text-green-700'>
              {videos.length} vídeo{videos.length > 1 ? 's' : ''} enviado{videos.length > 1 ? 's' : ''} com sucesso
            </p>
          </div>
        </div>
      )}
    </div>
  )
}