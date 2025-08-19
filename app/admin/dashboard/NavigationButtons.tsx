'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { PhoneCall, Users, MessageCircle, FileText } from 'lucide-react'

export function NavigationButtons() {
  return (
    <div className='flex justify-center flex-wrap gap-4 md:gap-6 mb-8'>
      <a href='/admin/calls'>
        <Button
          size='lg'
          className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3'
        >
          <PhoneCall className='w-5 h-5 mr-3' />
          Chamadas IA
        </Button>
      </a>

      <a href='/admin/users'>
        <Button
          size='lg'
          className='bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3'
        >
          <Users className='w-5 h-5 mr-3' />
          Usuários
        </Button>
      </a>

      <a href='/gerente?from=admin'>
        <Button
          size='lg'
          className='bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3'
        >
          <FileText className='w-5 h-5 mr-3' />
          Ocorrências
        </Button>
      </a>

      <a href='https://chat.msgsolucoes.com'>
        <Button
          size='lg'
          className='bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3'
        >
          <MessageCircle className='w-5 h-5 mr-3' />
          WhatsApp
        </Button>
      </a>
    </div>
  )
}
