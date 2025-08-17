'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Share2, 
  Copy, 
  MessageCircle, 
  QrCode, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface BotaoCompartilharLinkProps {
  sinistroId: string
  numeroSinistro: string
  createdByManager?: boolean
  status: string
  disabled?: boolean
}

export function BotaoCompartilharLink({ 
  sinistroId, 
  numeroSinistro, 
  createdByManager = false, 
  status,
  disabled = false 
}: BotaoCompartilharLinkProps) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [linkData, setLinkData] = useState<{
    link: string
    token: string
    expiresAt: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  // Não mostrar botão se não foi criado pelo gerente ou já está concluído
  if (!createdByManager || status === 'concluido') {
    return null
  }

  const gerarLink = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/completar-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sinistroId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao gerar link')
      }

      setLinkData({
        link: result.link,
        token: result.token,
        expiresAt: result.expiresAt
      })

    } catch (err: any) {
      console.error('Erro ao gerar link:', err)
      setError(err.message || 'Erro ao gerar link')
    } finally {
      setLoading(false)
    }
  }

  const copiarLink = async () => {
    if (!linkData?.link) return

    try {
      await navigator.clipboard.writeText(linkData.link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = linkData.link
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const abrirWhatsApp = () => {
    if (!linkData?.link) return

    const mensagem = `Olá! Para completar a documentação do seu sinistro *${numeroSinistro}*, acesse o link abaixo:

${linkData.link}

Este link é válido por 30 dias. Se tiver dúvidas, entre em contato conosco.

Atenciosamente,
Equipe PV Auto Proteção`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleOpenModal = () => {
    setShowModal(true)
    if (!linkData) {
      gerarLink()
    }
  }

  const formatarDataExpiracao = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Data inválida'
    }
  }

  return (
    <>
      <Button
        variant='outline'
        size='sm'
        onClick={handleOpenModal}
        disabled={disabled}
        className='h-8 w-8 p-0'
        title='Compartilhar link para completar documentação'
      >
        <Share2 className='w-4 h-4' />
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Share2 className='w-5 h-5 text-blue-600' />
              Compartilhar Link - #{numeroSinistro}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            {loading ? (
              <div className='text-center py-8'>
                <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto mb-4' />
                <p className='text-gray-600'>Gerando link...</p>
              </div>
            ) : error ? (
              <Alert className='border-red-200 bg-red-50'>
                <AlertCircle className='h-4 w-4 text-red-600' />
                <AlertDescription className='text-red-700'>{error}</AlertDescription>
              </Alert>
            ) : linkData ? (
              <>
                {/* Link */}
                <div>
                  <Label htmlFor='link'>Link para Completar Documentação</Label>
                  <div className='flex gap-2 mt-2'>
                    <Input
                      id='link'
                      value={linkData.link}
                      readOnly
                      className='font-mono text-sm'
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={copiarLink}
                      className='flex-shrink-0'
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className='w-4 h-4 mr-2 text-green-600' />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className='w-4 h-4 mr-2' />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Informações */}
                <div className='bg-blue-50 p-3 rounded-md text-sm'>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Válido até:</span>
                    <span className='font-medium'>{formatarDataExpiracao(linkData.expiresAt)}</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className='border rounded-md p-4'>
                  <Label className='text-sm font-medium mb-2 block'>QR Code</Label>
                  <div className='flex justify-center'>
                    <QRCodeSVG
                      value={linkData.link}
                      size={150}
                      bgColor='#ffffff'
                      fgColor='#000000'
                      level='M'
                      includeMargin={true}
                    />
                  </div>
                  <p className='text-xs text-gray-500 text-center mt-2'>
                    Cliente pode escanear para acessar facilmente
                  </p>
                </div>

                {/* Ações */}
                <div className='grid grid-cols-2 gap-3'>
                  <Button
                    variant='outline'
                    onClick={abrirWhatsApp}
                    className='flex items-center gap-2'
                  >
                    <MessageCircle className='w-4 h-4' />
                    WhatsApp
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => window.open(linkData.link, '_blank')}
                    className='flex items-center gap-2'
                  >
                    <ExternalLink className='w-4 h-4' />
                    Testar Link
                  </Button>
                </div>

                {/* Instruções */}
                <div className='bg-gray-50 p-3 rounded-md text-sm'>
                  <h4 className='font-medium mb-2'>Como usar:</h4>
                  <ul className='text-gray-600 space-y-1 text-xs'>
                    <li>• Copie o link e envie para o cliente</li>
                    <li>• Use o QR Code para facilitar o acesso via celular</li>
                    <li>• O WhatsApp já inclui uma mensagem padrão</li>
                    <li>• Link é válido por 30 dias</li>
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}