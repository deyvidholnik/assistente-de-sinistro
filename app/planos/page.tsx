"use client"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/context/theme-context"
import { 
  Shield, 
  CheckCircle, 
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Wrench,
  Phone,
  Clock,
  Star,
  Sun,
  Moon
} from "lucide-react"

export default function PlanosPage() {
  const { darkMode, toggleDarkMode } = useTheme()

  const handleWhatsAppClick = () => {
    window.open('https://api.whatsapp.com/send/?phone=5571997271993&text=Ol%C3%A1,%20quero%20uma%20cota%C3%A7%C3%A3o.&app_absent=0', '_blank')
  }

  const planos = [
    {
      name: "PV GOLD",
      color: "from-yellow-400 to-orange-500",
      bgColor: "from-yellow-50 to-orange-50",
      borderColor: "border-yellow-200",
      popular: false,
      preco: "Consulte",
      coberturas: [
        "Roubo 100% da FIPE",
        "Furto 100% da FIPE", 
        "Perda Total (PT) 100% da FIPE",
        "Incêndio Decorrente de colisão 100% da FIPE",
        "Fênomenos da natureza 100% da FIPE",
        "Colisão - Reparo do veículo"
      ],
      assistencias: [
        "Assistência 24h (300km)",
        "Indenização AP R$ 5.000,00",
        "Guincho Km livre para colisão",
        "Taxi",
        "Hotel"
      ]
    },
    {
      name: "PV PLATINUM", 
      color: "from-gray-400 to-gray-600",
      bgColor: "from-gray-50 to-slate-50",
      borderColor: "border-gray-200",
      popular: false,
      preco: "Consulte",
      coberturas: [
        "Roubo 100% da FIPE",
        "Furto 100% da FIPE",
        "Perda Total (PT) 100% da FIPE", 
        "Incêndio Decorrente de colisão 100% da FIPE",
        "Fênomenos da natureza 100% da FIPE",
        "Colisão - Reparo do veículo",
        "Proteção a Terceiros - Até R$ 40.000,00",
        "Carro Reserva - Até 07 dias",
        "Proteção Parabrisa/Vigia 60% (2x/ano)",
        "Proteção Faróis e Retrovisores 60% (2x/ano)"
      ],
      assistencias: [
        "Assistência 24h (400km)",
        "Indenização AP",
        "Guincho Km livre para colisão",
        "Taxi",
        "Hotel"
      ]
    },
    {
      name: "PV BLACK",
      color: "from-gray-800 to-black",
      bgColor: "from-gray-50 to-zinc-50", 
      borderColor: "border-gray-300",
      popular: true,
      preco: "Consulte",
      coberturas: [
        "Roubo 100% da FIPE",
        "Furto 100% da FIPE",
        "Perda Total (PT) 100% da FIPE",
        "Incêndio Decorrente de colisão 100% da FIPE", 
        "Fênomenos da natureza 100% da FIPE",
        "Colisão - Reparo do veículo",
        "Proteção a Terceiros - Até R$ 70.000,00",
        "Carro Reserva - Até 15 dias",
        "Proteção Parabrisa/Vigia 70% (2x/ano)",
        "Proteção Faróis e Retrovisores 70% (2x/ano)",
        "Reparo Rápido até R$ 500 (2x/ano)"
      ],
      assistencias: [
        "Assistência 24h (500km)",
        "Indenização AP",
        "Guincho Km livre para colisão",
        "Taxi",
        "Hotel",
        "Chaveiro", 
        "Recarga de bateria",
        "Troca de pneu"
      ]
    },
    {
      name: "PV EXTRA BLACK",
      color: "from-purple-600 to-indigo-800",
      bgColor: "from-purple-50 to-indigo-50",
      borderColor: "border-purple-200",
      popular: false,
      preco: "Consulte",
      coberturas: [
        "Roubo 100% da FIPE",
        "Furto 100% da FIPE",
        "Perda Total (PT) 100% da FIPE",
        "Incêndio Decorrente de colisão 100% da FIPE",
        "Fênomenos da natureza 100% da FIPE", 
        "Colisão - Reparo do veículo",
        "Proteção a Terceiros - Até R$ 100.000,00",
        "Carro Reserva - Até 30 dias",
        "Reparo Rápido até R$ 1.000,00 (2x/ano)",
        "Proteção Parabrisa/Vigia 80% (2x/ano)",
        "Proteção Faróis e Retrovisores 80% (2x/ano)"
      ],
      assistencias: [
        "Assistência 24h (1000km)",
        "Indenização AP",
        "Guincho Km livre para colisão",
        "Taxi",
        "Hotel",
        "Chaveiro",
        "Recarga de bateria", 
        "Troca de pneu"
      ]
    }
  ]

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
              <Link href="/">
                <Button variant="ghost" className={`hover:bg-opacity-20 transition-all duration-300 ${darkMode ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
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
            🛡️ Proteção Completa para seu Veículo
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Escolha seu Plano de
            <br />
            Proteção Veicular
          </h1>
          <p className={`text-lg md:text-xl mb-8 max-w-3xl mx-auto px-4 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Todos os planos incluem rastreador e oferecem proteção completa para seu veículo. 
            Escolha o plano que melhor se adequa às suas necessidades.
          </p>
        </div>
      </section>

      {/* Planos Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 px-4">
            {planos.map((plano, index) => (
              <Card key={index} className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${darkMode ? 'bg-gray-700/50 backdrop-blur-sm border border-gray-600/50' : `${plano.bgColor} ${plano.borderColor} border-2`} relative`}>
                {plano.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 text-xs font-semibold">
                      MAIS POPULAR
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r ${plano.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Shield className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <CardTitle className={`text-lg md:text-xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {plano.name}
                  </CardTitle>
                  <div className="flex items-center justify-center mb-4">
                    <MapPin className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="text-sm text-blue-600 font-medium">Rastreador Incluído</span>
                  </div>
                  <div className={`text-2xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {plano.preco}
                  </div>
                </CardHeader>
                <CardContent className="px-4 md:px-6">
                  <div className="mb-6">
                    <h4 className={`font-semibold mb-3 flex items-center text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      <ShieldCheck className="w-4 h-4 mr-2 text-green-600" />
                      Coberturas
                    </h4>
                    <ul className="space-y-2">
                      {plano.coberturas.map((cobertura, idx) => (
                        <li key={idx} className={`flex items-start text-xs md:text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{cobertura}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className={`font-semibold mb-3 flex items-center text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      <Wrench className="w-4 h-4 mr-2 text-blue-600" />
                      Assistências
                    </h4>
                    <ul className="space-y-2">
                      {plano.assistencias.map((assistencia, idx) => (
                        <li key={idx} className={`flex items-start text-xs md:text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{assistencia}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <Button onClick={handleWhatsAppClick} className={`w-full bg-gradient-to-r ${plano.color} hover:opacity-90 text-white font-semibold py-3 text-sm md:text-base`}>
                      Contratar {plano.name}
                    </Button>
                    <Button variant="outline" onClick={handleWhatsAppClick} className={`w-full py-3 text-sm md:text-base transition-all duration-300 ${darkMode ? 'border-gray-500 text-gray-300 hover:bg-gray-700/50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Solicitar Cotação
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios Section */}
      <section className={`py-12 md:py-20 px-4 transition-all duration-300 ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Vantagens da Proteção Veicular
            </h2>
            <p className={`text-base md:text-lg max-w-2xl mx-auto px-4 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Diferenças entre proteção veicular e seguro tradicional
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 px-4">
            <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-white'}`}>
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Agilidade</h3>
                <p className={`transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Sem burocracia excessiva. Processo mais rápido e eficiente para resolver sinistros.
                </p>
              </CardContent>
            </Card>

            <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-white'}`}>
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Custo-Benefício</h3>
                <p className={`transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Mensalidades mais acessíveis com a mesma proteção completa para seu veículo.
                </p>
              </CardContent>
            </Card>

            <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-white'}`}>
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Proteção Total</h3>
                <p className={`transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Cobertura completa: roubo, furto, colisão, fenômenos naturais e muito mais.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`text-white py-8 md:py-12 px-4 transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-900'}`}>
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="relative w-8 h-8">
              <Image
                src="/images/logo.png"
                alt="PV Auto Proteção"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="text-lg font-bold">PV Auto Proteção</div>
          </div>
          <p className="text-gray-400 mb-6">
            Proteção veicular inteligente com tecnologia avançada para sua tranquilidade.
          </p>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-sm text-gray-400">
              &copy; 2024 PV Auto Proteção. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 