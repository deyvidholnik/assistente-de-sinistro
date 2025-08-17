'use client'

import React from 'react'

interface AdminPageWrapperProps {
  children: React.ReactNode
  isDark: boolean
}

export function AdminPageWrapper({ children, isDark }: AdminPageWrapperProps) {
  return (
    <div
      className={`min-h-screen w-full  transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}
    >
      {children}
    </div>
  )
}
