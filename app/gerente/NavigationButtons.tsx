'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, Copy, Check } from 'lucide-react'

export function NavigationButtons() {
  const [copied, setCopied] = useState(false)

  const copiarLinkAssistencia = async () => {
    try {
      await navigator.clipboard.writeText('https://pvautoprotecao.com.br/registro_ocorrencia')
      setCopied(true)

      // Reset do estado após 2 segundos
      setTimeout(() => {
        setCopied(false)
      }, 2000)

      // Mostrar toast
      if (typeof window !== 'undefined') {
        // Criar elemento toast
        const toast = document.createElement('div')
        toast.className =
          'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2'
        toast.textContent = 'Link copiado!'

        document.body.appendChild(toast)

        // Remover toast após 3 segundos
        setTimeout(() => {
          toast.remove()
        }, 3000)
      }
    } catch (err) {
      console.error('Erro ao copiar link:', err)

      // Fallback toast para erro
      if (typeof window !== 'undefined') {
        const toast = document.createElement('div')
        toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
        toast.textContent = 'Erro ao copiar link'

        document.body.appendChild(toast)

        setTimeout(() => {
          toast.remove()
        }, 3000)
      }
    }
  }

  return (
    <div className='flex justify-center flex-wrap gap-4 md:gap-6 mb-8'>
      <a
        href='https://chat.msgsolucoes.com'
        target='_blank'
        rel='noopener noreferrer'
      >
        <Button
          size='lg'
          className='bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3'
        >
          <MessageCircle className='w-5 h-5 mr-3' />
          WhatsApp
        </Button>
      </a>

      <Button
        size='lg'
        onClick={copiarLinkAssistencia}
        className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3'
      >
        {copied ? <Check className='w-5 h-5 mr-3' /> : <Copy className='w-5 h-5 mr-3' />}
        Link Abrir Ocorrência
      </Button>
    </div>
  )
  
}
