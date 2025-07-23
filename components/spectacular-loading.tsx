"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Car, Shield, Zap, Star, Heart, Sparkles } from 'lucide-react'

interface SpectacularLoadingProps {
  onComplete?: () => void
}

export default function SpectacularLoading({ onComplete }: SpectacularLoadingProps) {
  const [progress, setProgress] = useState(0)
  const [showCars, setShowCars] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [currentPhrase, setCurrentPhrase] = useState(0)

  const phrases = [
    '🚗 Ligando os motores...',
    '🛡️ Ativando proteção...',
    '⚡ Carregando super poderes...',
    '🌟 Polindo os para-choques...',
    '🔧 Ajustando os retrovisores...',
    '💨 Enchendo os pneus...',
    '🎯 Calibrando sensores...',
    '🚀 Preparando para decolagem!'
  ]

  const carEmojis = ['🚗', '🚙', '🚕', '🚌', '🚚', '🏎️', '🚓', '🚑']
  const funEmojis = ['🌟', '⭐', '✨', '💫', '🎉', '🎊', '🔥', '💎']

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setTimeout(() => onComplete?.(), 1000)
          return 100
        }
        return prev + 1
      })
    }, 50)

    setTimeout(() => setShowCars(true), 500)
    setTimeout(() => setShowEmojis(true), 1000)

    return () => clearInterval(interval)
  }, [onComplete])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase(prev => (prev + 1) % phrases.length)
    }, 800)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const text = phrases[currentPhrase]
    let index = 0
    setLoadingText('')
    
    const typing = setInterval(() => {
      setLoadingText(text.slice(0, index))
      index++
      if (index > text.length) {
        clearInterval(typing)
      }
    }, 100)

    return () => clearInterval(typing)
  }, [currentPhrase])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden"
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{
              y: [null, -100, window.innerHeight + 100],
              scale: [0, 1, 0],
              rotate: 360
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Floating Cars */}
      <AnimatePresence>
        {showCars && (
          <div className="absolute inset-0 pointer-events-none">
            {carEmojis.map((car, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                initial={{ x: -100, y: Math.random() * window.innerHeight }}
                animate={{ 
                  x: window.innerWidth + 100,
                  y: Math.random() * window.innerHeight,
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: Math.random() * 3 + 4,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
              >
                {car}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Floating Fun Emojis */}
      <AnimatePresence>
        {showEmojis && (
          <div className="absolute inset-0 pointer-events-none">
            {funEmojis.map((emoji, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 50,
                  scale: 0
                }}
                animate={{
                  y: -50,
                  scale: [0, 1.5, 1, 0],
                  rotate: [0, 180, 360],
                  x: Math.random() * window.innerWidth
                }}
                transition={{
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="text-center z-10 px-8">
        {/* Breathing Logo */}
        <motion.div
          className="mb-8 relative"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.div
            className="w-32 h-32 mx-auto bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl"
            animate={{
              boxShadow: [
                "0 0 20px rgba(255, 255, 0, 0.5)",
                "0 0 40px rgba(255, 165, 0, 0.8)",
                "0 0 20px rgba(255, 255, 0, 0.5)"
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Shield className="w-16 h-16 text-white" />
            </motion.div>
          </motion.div>

          {/* Orbiting Icons */}
          {[Car, Zap, Star, Heart].map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute w-8 h-8 text-white"
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: '50px'
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
                delay: i * 1
              }}
            >
              <Icon className="w-6 h-6" />
            </motion.div>
          ))}
        </motion.div>

        {/* Animated Title */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-8"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            PV Auto
          </motion.h1>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white"
            animate={{
              scale: [1, 1.05, 1],
              textShadow: [
                "0 0 10px rgba(255, 255, 255, 0.5)",
                "0 0 20px rgba(255, 255, 255, 0.8)",
                "0 0 10px rgba(255, 255, 255, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Proteção
          </motion.h2>
        </motion.div>

        {/* Typing Animation */}
        <motion.div
          className="mb-8 h-12 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.p 
            className="text-2xl text-yellow-300 font-semibold"
            key={currentPhrase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {loadingText}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-white"
            >
              |
            </motion.span>
          </motion.p>
        </motion.div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <motion.div
            className="w-full h-4 bg-gray-700 rounded-full overflow-hidden shadow-inner mb-4"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full relative overflow-hidden"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="flex justify-between items-center text-white text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <span>{progress}%</span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </motion.div>
          </motion.div>
        </div>

        {/* Final Message */}
        {progress >= 90 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8"
          >
            <motion.p
              className="text-2xl text-green-400 font-bold"
              animate={{
                scale: [1, 1.1, 1],
                textShadow: [
                  "0 0 10px rgba(34, 197, 94, 0.5)",
                  "0 0 20px rgba(34, 197, 94, 0.8)",
                  "0 0 10px rgba(34, 197, 94, 0.5)"
                ]
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              🎉 Pronto para proteger! 🎉
            </motion.p>
          </motion.div>
        )}
      </div>

      {/* Corner Decorations */}
      <motion.div
        className="absolute top-4 left-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <Star className="w-8 h-8 text-yellow-400" />
      </motion.div>

      <motion.div
        className="absolute top-4 right-4"
        animate={{ rotate: -360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-8 h-8 text-pink-400" />
      </motion.div>

      <motion.div
        className="absolute bottom-4 left-4"
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Heart className="w-8 h-8 text-red-400" />
      </motion.div>

      <motion.div
        className="absolute bottom-4 right-4"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Zap className="w-8 h-8 text-yellow-400" />
      </motion.div>
    </motion.div>
  )
} 