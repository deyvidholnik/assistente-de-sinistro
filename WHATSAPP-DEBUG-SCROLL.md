# 🐛 DEBUG - PROBLEMA SCROLL SEPARADORES

## 🚨 **PROBLEMA RELATADO**

O usuário quer uma **regra específica** para o separador fixo:
- **Tag na metade inferior da tela** → mostrar separador do **dia anterior**
- **Tag na metade superior da tela** → mostrar separador **atual** (da própria tag)
- **Lógica baseada na posição** da tag em relação ao centro da viewport

## 🔧 **CORREÇÕES IMPLEMENTADAS**

### **1. 🎯 Nova Abordagem com Scroll Listener:**
```javascript
// Função que roda a cada scroll
const verificarSeparadores = () => {
  const centroTela = window.innerHeight / 2
  
  // Pegar TODOS os separadores diretamente da DOM
  const todosSeparadores = Object.entries(separadoresRefs.current)
    .filter(([key, ref]) => ref)
    .map(([key, ref]) => {
      const rect = ref.getBoundingClientRect()
      return {
        label: ref.getAttribute('data-separador'),
        posicaoTopo: rect.top,
        posicaoBottom: rect.bottom
      }
    })
    .sort((a, b) => a.posicaoTopo - b.posicaoTopo)

  // Aplicar regra: tag na metade inferior → separador anterior
  for (let atual of separadoresVisiveis) {
    if (atual.posicaoTopo > centroTela) {
      separadorEscolhido = anterior.label // ← ANTERIOR
      break
    } else {
      separadorEscolhido = atual.label // ← ATUAL
    }
  }
}
```

### **2. 📊 Logs Detalhados em Tempo Real:**
```javascript
console.log('🔍 Verificando separadores - Centro da tela:', centroTela.toFixed(0) + 'px')
console.log('📊 Todos os separadores encontrados:', todosSeparadores.map(s => 
  `${s.label}: ${s.posicaoTopo.toFixed(0)}px`
))
console.log('👁️ Separadores na área visível:', separadoresVisiveis.map(s => 
  `${s.label}: ${s.posicaoTopo.toFixed(0)}px`
))
console.log('⬇️ Tag', atual.label, 'na metade inferior → usando anterior:', anterior.label)
console.log('⬆️ Tag', atual.label, 'na metade superior → usando atual')
console.log('🔄 MUDANDO separador fixo:', separadorFixo, '→', separadorEscolhido)
```

### **3. 🎯 Scroll Listener:**
```javascript
// Verificar separadores no scroll
const handleScroll = () => {
  verificarSeparadores()
}

container.addEventListener('scroll', handleScroll, { passive: true })
```

## 🧪 **COMO TESTAR**

### **📱 Teste de Scroll:**
1. **Abra** `/admin/whatsapp/conversa`
2. **Abra DevTools** (F12)
3. **Vá para Console**
4. **Escolha** contato com várias mensagens
5. **Role para baixo** devagar → veja logs ✅
6. **Role para cima** devagar → veja logs 🔍

### **👀 O que observar:**
```
🔍 Verificando separadores - Centro da tela: 400px
📊 Todos os separadores encontrados: ["Hoje: 150px", "Ontem: 480px", "Segunda: 750px"]
👁️ Separadores na área visível: ["Hoje: 150px", "Ontem: 480px"]
⬇️ Tag Ontem na metade inferior (pos: 480) → usando anterior: Hoje
🔄 MUDANDO separador fixo: Ontem → Hoje
```

## 🎯 **RESULTADO ESPERADO**

### **⬇️ Descendo (já funciona):**
- `Hoje → Ontem → Segunda → 21/06/25`

### **⬆️ Subindo (deve funcionar agora):**
- `21/06/25 → Segunda → Ontem → Hoje`
- **Mudança imediata** quando separador entra pelo topo
- **Sem atraso** entre mensagens e separador

## 🔍 **CONFIGURAÇÃO ATUAL**

### **🎯 Scroll Listener Direto:**
- **Método:** `addEventListener('scroll', handleScroll, { passive: true })`
- **Trigger:** A cada scroll em tempo real
- **Detecção:** `getBoundingClientRect()` direto dos refs

### **📏 Lógica de Seleção:**
1. **Calcular** centro da viewport (`window.innerHeight / 2`)
2. **Pegar todos** os separadores da DOM via refs
3. **Filtrar** separadores na área visível (-50px a +50px)
4. **Aplicar regra:** 
   - Tag **abaixo do centro** → separador **anterior**
   - Tag **acima do centro** → separador **atual**
5. **Resultado:** Mudança imediata no separador fixo

## ✅ **PRÓXIMOS PASSOS**

1. **Testar** com logs ativos
2. **Verificar** comportamento no scroll up
3. **Ajustar** rootMargin se necessário
4. **Remover** logs após confirmação

**Se ainda não funcionar, ajustaremos os parâmetros baseado nos logs! 🔧** 