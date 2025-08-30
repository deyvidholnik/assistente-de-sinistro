'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

export function NavigationButtons() {
  return (
    <div className='flex justify-center flex-wrap gap-4 md:gap-6 mb-8'>
      <a href='https://chat.msgsolucoes.com' target='_blank' rel='noopener noreferrer'>
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