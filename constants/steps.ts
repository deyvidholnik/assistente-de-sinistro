import { Shield, CreditCard, FileText, Car, CheckCircle, AlertCircle, ClipboardList, ShieldAlert } from "lucide-react"
import type { FotoVeiculoStep } from "@/types"

export const steps = [
  { id: 1, title: "Início", icon: Shield, description: "Bem-vindo ao sistema" },
  { id: 2, title: "Tipo", icon: ClipboardList, description: "Tipo de Sinistro" },
  { id: 3, title: "Situação", icon: ShieldAlert, description: "Situação dos Documentos" },
  { id: 4, title: "CNH", icon: CreditCard, description: "Foto da Habilitação" },
  { id: 5, title: "CRLV", icon: FileText, description: "Documento do Veículo" },
  { id: 6, title: "B.O.", icon: FileText, description: "Boletim de Ocorrência" },
  { id: 7, title: "Fotos do Veículo", icon: Car, description: "Fotos guiadas" },
  { id: 8, title: "Terceiros", icon: AlertCircle, description: "Outros veículos" },
  { id: 9, title: "Finalização", icon: CheckCircle, description: "Envio concluído" },
]

export const fotoVeiculoSteps: FotoVeiculoStep[] = [
  {
    id: 1,
    titulo: "Traseira e Placa do Seu Veículo",
    descricao: "Foto da traseira completa incluindo a placa do seu veículo",
    instrucoes: [
      "Garanta boa iluminação e que a placa esteja legível.",
      "Capture a traseira inteira, mostrando para-choque e danos.",
    ],
    posicionamento: [
      "📱 Celular na HORIZONTAL.",
      "📏 Afaste-se 3-4 metros para enquadrar tudo.",
      "🎯 Centralize o veículo, focando na placa.",
    ],
    exemplo: "Vista traseira completa com placa bem visível: ABC-1234 ou ABC1D23",
    obrigatoria: true,
    imagemExemplo: "",
    categoria: "proprio",
  },
  {
    id: 2,
    titulo: "Frente do Seu Veículo",
    descricao: "Vista completa da parte frontal do seu veículo",
    instrucoes: [
      "Use boa iluminação para mostrar os danos.",
      "Capture a frente inteira, incluindo para-choque e faróis.",
    ],
    posicionamento: [
      "📱 Celular na HORIZONTAL.",
      "📏 Afaste-se 3-4 metros para uma visão completa.",
      "🎯 Centralize o veículo na foto.",
    ],
    exemplo: "Vista frontal completa mostrando toda a frente",
    obrigatoria: true,
    imagemExemplo: "",
    categoria: "proprio",
  },
  {
    id: 3,
    titulo: "Lateral Direita do Seu Veículo",
    descricao: "Lado direito completo do seu veículo",
    instrucoes: [
      "Capture a lateral inteira, da roda dianteira à traseira.",
      "Mostre todos os danos, incluindo portas e rodas.",
    ],
    posicionamento: [
      "📱 Celular na HORIZONTAL.",
      "📏 Afaste-se 2-3 metros da lateral.",
      "🎯 Enquadre o veículo por completo.",
    ],
    exemplo: "Vista lateral direita completa",
    obrigatoria: true,
    imagemExemplo: "",
    categoria: "proprio",
  },
  {
    id: 4,
    titulo: "Lateral Esquerda do Seu Veículo",
    descricao: "Lado esquerdo completo do seu veículo",
    instrucoes: [
      "Capture a lateral inteira, da roda dianteira à traseira.",
      "Mostre todos os danos, incluindo portas e rodas.",
    ],
    posicionamento: [
      "📱 Celular na HORIZONTAL.",
      "📏 Afaste-se 2-3 metros da lateral.",
      "🎯 Enquadre o veículo por completo.",
    ],
    exemplo: "Vista lateral esquerda completa",
    obrigatoria: true,
    imagemExemplo: "",
    categoria: "proprio",
  },
  {
    id: 5,
    titulo: "Danos Específicos do Seu Veículo",
    descricao: "Fotos detalhadas dos principais danos",
    instrucoes: [
      "Aproxime-se dos principais danos para mostrar detalhes.",
      "Use boa iluminação, com flash se precisar.",
    ],
    posicionamento: [
      "📱 Use o celular na VERTICAL ou HORIZONTAL.",
      "🔍 Aproxime-se a 30-50cm do dano.",
      "🎯 Foque no dano, mostrando a área ao redor.",
    ],
    exemplo: "Close-up detalhado dos danos principais",
    obrigatoria: true,
    imagemExemplo: "",
    categoria: "proprio",
  },
  // Fotos dos outros veículos (5 fotos cada - mesma estrutura)
  {
    id: 6,
    titulo: "Traseira e Placa do Outro Veículo",
    descricao: "Traseira e placa de outros veículos envolvidos",
    instrucoes: [
      "Garanta boa iluminação e que a placa esteja legível.",
      "Capture a traseira inteira, mostrando para-choque e danos.",
    ],
    posicionamento: [
      "📱 Celular na HORIZONTAL.",
      "📏 Afaste-se 3-4 metros para enquadrar tudo.",
      "🎯 Centralize o veículo, focando na placa.",
    ],
    exemplo: "Traseira e placa dos outros veículos no acidente",
    obrigatoria: false,
    imagemExemplo: "",
    categoria: "outros",
  },
  {
    id: 7,
    titulo: "Frente do Outro Veículo",
    descricao: "Vista frontal dos outros veículos",
    instrucoes: [
      "Use boa iluminação para mostrar os danos.",
      "Capture a frente inteira, incluindo para-choque e faróis.",
    ],
    posicionamento: [
      "📱 Celular na HORIZONTAL.",
      "📏 Afaste-se 3-4 metros para uma visão completa.",
      "🎯 Centralize o veículo na foto.",
    ],
    exemplo: "Frente dos outros veículos envolvidos",
    obrigatoria: false,
    imagemExemplo: "",
    categoria: "outros",
  },
  {
    id: 8,
    titulo: "Lateral Direita do Outro Veículo",
    descricao: "Vista lateral direita dos outros veículos",
    instrucoes: [
      "Capture a lateral inteira, da roda dianteira à traseira.",
      "Mostre todos os danos, incluindo portas e rodas.",
    ],
    posicionamento: [
      "📱 Celular na HORIZONTAL.",
      "📏 Afaste-se 2-3 metros da lateral.",
      "🎯 Enquadre o veículo por completo.",
    ],
    exemplo: "Lateral direita dos outros veículos",
    obrigatoria: false,
    imagemExemplo: "",
    categoria: "outros",
  },
  {
    id: 9,
    titulo: "Lateral Esquerda do Outro Veículo",
    descricao: "Vista lateral esquerda dos outros veículos",
    instrucoes: [
      "Capture a lateral inteira, da roda dianteira à traseira.",
      "Mostre todos os danos, incluindo portas e rodas.",
    ],
    posicionamento: [
      "📱 Celular na HORIZONTAL.",
      "📏 Afaste-se 2-3 metros da lateral.",
      "🎯 Enquadre o veículo por completo.",
    ],
    exemplo: "Lateral esquerda dos outros veículos",
    obrigatoria: false,
    imagemExemplo: "",
    categoria: "outros",
  },
  {
    id: 10,
    titulo: "Danos Específicos do Outro Veículo",
    descricao: "Danos específicos dos outros veículos",
    instrucoes: [
      "Aproxime-se dos principais danos para mostrar detalhes.",
      "Use boa iluminação, com flash se precisar.",
    ],
    posicionamento: [
      "📱 Use o celular na VERTICAL ou HORIZONTAL.",
      "🔍 Aproxime-se a 30-50cm do dano.",
      "🎯 Foque no dano, mostrando a área ao redor.",
    ],
    exemplo: "Danos detalhados dos outros veículos",
    obrigatoria: false,
    imagemExemplo: "",
    categoria: "outros",
  },
  // Foto geral do local
  {
    id: 11,
    titulo: "Visão Geral do Local",
    descricao: "Foto panorâmica do local do acidente",
    instrucoes: [
      "Capture a cena inteira, mostrando a posição dos veículos.",
      "Inclua referências da rua (placas, semáforos).",
    ],
    posicionamento: [
      "📱 Celular na HORIZONTAL.",
      "🏃 Afaste-se o suficiente para mostrar tudo (10-15m).",
      "🎯 Enquadre todos os veículos e o local do acidente.",
    ],
    exemplo: "Vista geral do local do sinistro",
    obrigatoria: false,
    imagemExemplo: "",
    categoria: "geral",
  },
]
