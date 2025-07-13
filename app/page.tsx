"use client"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/context/theme-context"
import { 
  Shield, 
  Clock, 
  Users, 
  CheckCircle, 
  Star, 
  ArrowRight,
  Car,
  FileText,
  Smartphone,
  Zap,
  Heart,
  Award,
  Sun,
  Moon
} from "lucide-react"

export default function LandingPage() {
  const { darkMode, toggleDarkMode } = useTheme()

 
  const handleWhatsAppClick = (buttonText: string) => {
    const text = encodeURIComponent(buttonText)
    window.open(`https://api.whatsapp.com/send/?phone=5571997271993&text=${text}&app_absent=0`, '_blank')
  }


  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b sticky top-0 z-50 transition-all duration-300 ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-blue-100'}`}>
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="relative w-12 h-12 md:w-14 md:h-14">
                <Image
                  src="/images/logo.png"
                  alt="PV Auto Proteção"
                  width={56}
                  height={56}
                  className="object-contain rounded-full"
                />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent">
                  PV Auto Proteção
                </h1>
                <p className={`text-xs md:text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Proteção Veicular</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className={`hover:bg-opacity-20 transition-all duration-300 ${darkMode ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'}`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Link href="/login_cliente">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm md:text-base px-3 md:px-4">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className={`mb-4 md:mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 text-xs md:text-sm transition-all duration-300 ${darkMode ? 'from-blue-900 to-purple-900 text-blue-200 border-blue-700' : ''}`}>
            🛡️ Proteção Veicular Inteligente
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Proteja Melhor.
            <br />
            Resolva Mais Rápido.
          </h1>
          <p className={`text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto px-4 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            A PV Auto Proteção oferece tecnologia avançada para abrir ocorrências de forma rápida e intuitiva, 
            garantindo melhor agilidade ao processo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            
              <Button onClick={() => handleWhatsAppClick("Abrir uma Ocorrência")} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 md:px-8 py-4 md:py-6 text-base md:text-lg w-full sm:w-auto">
                Abrir uma Ocorrência
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </Button>
           
            <Link href="/planos">
              <Button size="lg" variant="outline" className={`px-6 md:px-8 py-4 md:py-6 text-base md:text-lg w-full sm:w-auto transition-all duration-300 ${darkMode ? 'border-blue-400 text-blue-300 hover:bg-blue-800/20 hover:border-blue-300' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}`}>
                Conheça os Planos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-12 md:py-20 px-4 transition-all duration-300 ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tecnologia que Acelera sua Proteção
            </h2>
            <p className={`text-base md:text-lg max-w-2xl mx-auto px-4 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Nossa plataforma combina inteligência artificial e facilidade de uso para transformar como você abre ocorrências.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 px-4">
            <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 group ${darkMode ? 'bg-gray-700/50 backdrop-blur-sm border border-gray-600/50' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className={`text-lg md:text-xl font-bold mb-3 md:mb-4 transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Leitura Inteligente</h3>
                <p className={`mb-3 md:mb-4 text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Dados extraídos automaticamente de documentos usando nossa tecnologia de reconhecimento óptico de caracteres.
                </p>
                <div className="flex justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 group ${darkMode ? 'bg-gray-700/50 backdrop-blur-sm border border-gray-600/50' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className={`text-lg md:text-xl font-bold mb-3 md:mb-4 transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Processo Rápido</h3>
                <p className={`mb-3 md:mb-4 text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Fluxo otimizado em etapas guiadas que levam você do início à finalização em minutos.
                </p>
                <div className="flex justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 group ${darkMode ? 'bg-gray-700/50 backdrop-blur-sm border border-gray-600/50' : 'bg-gradient-to-br from-indigo-50 to-blue-50'}`}>
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className={`text-lg md:text-xl font-bold mb-3 md:mb-4 transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Documentação Digital</h3>
                <p className={`mb-3 md:mb-4 text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Upload seguro de documentos e fotos com armazenamento em nuvem e backup automático.
                </p>
                <div className="flex justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-blue-100 text-sm md:text-base">Disponibilidade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-white mb-2">&lt; 5min</div>
              <div className="text-blue-100 text-sm md:text-base">Tempo Médio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100 text-sm md:text-base">Suporte</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-blue-100 text-sm md:text-base">Segurança</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Por que Escolher Proteção Veicular?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center px-4">
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg md:text-xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Processos Ágeis</h3>
                  <p className={`text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Resolva suas ocorrências em tempo real com nossa tecnologia avançada, sem burocracias desnecessárias.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg md:text-xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Proteção Completa</h3>
                  <p className={`text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cobertura total contra roubo, furto, colisão, fenômenos naturais e assistência 24 horas.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg md:text-xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Atendimento Humanizado</h3>
                  <p className={`text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Equipe especializada e dedicada pronta para ajudar em qualquer momento do dia.</p>
                </div>
              </div>
            </div>
            
            <div className={`bg-gradient-to-br from-blue-50 to-purple-50 p-6 md:p-8 rounded-3xl transition-all duration-300 ${darkMode ? 'from-blue-900/20 to-purple-900/20' : ''}`}>
              <div className="text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <Car className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                <h3 className={`text-xl md:text-2xl font-bold mb-3 md:mb-4 transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Seu Veículo Protegido</h3>
                <p className={`text-base md:text-lg transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Com a PV Auto Proteção, você tem tranquilidade total sabendo que seu veículo está nas melhores mãos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Ampliada */}
      <section className={`py-16 md:py-28 px-4 transition-all duration-300 ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <div className="container mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nossos Associados Recomendam
            </h2>
            <p className={`text-lg md:text-xl max-w-3xl mx-auto px-4 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Milhares de pessoas já confiam na PV Auto Proteção para proteger seus veículos. Veja o que nossos associados dizem sobre nós.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-10 px-4 mb-12">
            <Card className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${darkMode ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-white'}`}>
              <CardContent className="p-8 md:p-10">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className={`mb-6 md:mb-8 text-base md:text-lg leading-relaxed transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  "Excelente atendimento! Quando precisei usar, foi muito rápido e eficiente. O sistema é intuitivo e consegui resolver tudo online sem complicações."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    RS
                  </div>
                  <div className="ml-4">
                    <div className={`font-bold text-base md:text-lg transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Roberto Silva</div>
                    <div className={`text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Associado há 4 anos • Engenheiro</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${darkMode ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-white'}`}>
              <CardContent className="p-8 md:p-10">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className={`mb-6 md:mb-8 text-base md:text-lg leading-relaxed transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  "Tive um problema com meu carro e fui super bem atendida. A equipe é muito profissional e resolve tudo rapidamente. Recomendo demais!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    LC
                  </div>
                  <div className="ml-4">
                    <div className={`font-bold text-base md:text-lg transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Luciana Costa</div>
                    <div className={`text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Associada há 1 ano • Advogada</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${darkMode ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-white'}`}>
              <CardContent className="p-8 md:p-10">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className={`mb-6 md:mb-8 text-base md:text-lg leading-relaxed transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  "A tecnologia deles é incrível! Só fotografei meus documentos e o sistema preencheu tudo automaticamente. Muito prático e moderno."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    TM
                  </div>
                  <div className="ml-4">
                    <div className={`font-bold text-base md:text-lg transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Thiago Moreira</div>
                    <div className={`text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Associado há 6 meses • Desenvolvedor</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${darkMode ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-white'}`}>
              <CardContent className="p-8 md:p-10">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className={`mb-6 md:mb-8 text-base md:text-lg leading-relaxed transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  "Consegui abrir minha ocorrência em menos de 5 minutos. A leitura inteligente reconheceu todos os dados da minha CNH perfeitamente! Processo muito mais simples que esperava."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    MJ
                  </div>
                  <div className="ml-4">
                    <div className={`font-bold text-base md:text-lg transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Maria José</div>
                    <div className={`text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Associada há 2 anos • Professora</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${darkMode ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-white'}`}>
              <CardContent className="p-8 md:p-10">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className={`mb-6 md:mb-8 text-base md:text-lg leading-relaxed transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  "Mensalidade mais barata que seguro tradicional e com a mesma proteção. Processo muito mais rápido e menos burocrático. Recomendo para todos!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    CS
                  </div>
                  <div className="ml-4">
                    <div className={`font-bold text-base md:text-lg transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Carlos Silva</div>
                    <div className={`text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Associado há 1 ano • Empresário</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${darkMode ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-white'}`}>
              <CardContent className="p-8 md:p-10">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className={`mb-6 md:mb-8 text-base md:text-lg leading-relaxed transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  "A melhor proteção veicular que já contratei. Custo-benefício excelente e atendimento sempre disponível. Já indiquei para toda minha família."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    AS
                  </div>
                  <div className="ml-4">
                    <div className={`font-bold text-base md:text-lg transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Ana Santos</div>
                    <div className={`text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Associada há 3 anos • Médica</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas de Satisfação */}
          <div className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className={`text-4xl md:text-5xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>98%</div>
                <div className={`text-base md:text-lg transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Satisfação dos Associados</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl md:text-5xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>+50k</div>
                <div className={`text-base md:text-lg transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Veículos Protegidos</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl md:text-5xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>95%</div>
                <div className={`text-base md:text-lg transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Recomendariam</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
              Pronto para Proteger seu Veículo?
            </h2>
            <p className="text-lg md:text-xl text-blue-100 mb-6 md:mb-8">
              Junte-se a milhares de associados que já confiam na PV Auto Proteção para proteger seus veículos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button size="lg" onClick={() => handleWhatsAppClick("Contratar Proteção")}  className="bg-white text-blue-600 hover:bg-blue-50 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-bold w-full sm:w-auto">
                Contratar Proteção 
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </Button>
              <Link href="/planos">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-bold w-full sm:w-auto">
                  Conheça os Planos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`text-white py-8 md:py-12 px-4 transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-900'}`}>
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative w-6 h-6 md:w-8 md:h-8">
                  <Image
                    src="/images/logo.png"
                    alt="PV Auto Proteção"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div className="text-base md:text-lg font-bold">PV Auto Proteção</div>
              </div>
              <p className="text-gray-400 text-sm md:text-base">
                Proteção veicular inteligente com tecnologia avançada para sua tranquilidade.
              </p>
            </div>
            
            
            
            <div>
              <h4 className="font-bold mb-4 text-sm md:text-base">Suporte</h4>
              <ul className="space-y-2 text-gray-400 text-sm md:text-base">
                <li><a  onClick={() => handleWhatsAppClick("Preciso de ajuda")} className="hover:text-white">Central de Ajuda</a></li>
                <li><a  onClick={() => handleWhatsAppClick("Quais meios para contato?")} className="hover:text-white">Contato</a></li>
                <li><a  onClick={() => handleWhatsAppClick("Preciso de suporte")} className="hover:text-white">Suporte 24h</a></li>
              </ul>
            </div>
            
          </div>
          
          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400">
            <p className="text-sm md:text-base">&copy; 2024 PV Auto Proteção. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
