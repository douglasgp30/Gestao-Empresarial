# 🚨 PREVENÇÃO - TELA PISCANDO

Este documento lista as principais causas de **tela piscando** no sistema e como evitá-las.

## ⚠️ PRINCIPAIS CAUSAS DE PISCAR

### 1. **useEffect com dependências instáveis**
```typescript
// ❌ RUIM - FAZ PISCAR
useEffect(() => {
  setAlgumaCoisa(...)
}, [clientes, tecnicos, formasPagamento]) // Arrays mudam constantemente

// ✅ BOM - ESTÁVEL
useEffect(() => {
  setAlgumaCoisa(...)
}, [clientes.length, tecnicos.length]) // Só .length como dependência
```

### 2. **useCallback/useMemo com arrays como dependência**
```typescript
// ❌ RUIM - FAZ PISCAR
const recarregarClientes = useCallback(async () => {
  // ...
}, [carregarClientesAPI, clientes.length]) // clientes.length cria ciclo!

// ✅ BOM - ESTÁVEL
const recarregarClientes = useCallback(async () => {
  // ...
}, [carregarClientesAPI]) // Só dependências estáveis
```

### 3. **Múltiplas chamadas de recarregamento**
```typescript
// ❌ RUIM - FAZ PISCAR
for (let i = 0; i < 5; i++) {
  await recarregarClientes(); // Múltiplos recarregamentos
}

// ✅ BOM - ESTÁVEL
setTimeout(async () => {
  await recarregarClientes(); // Só uma vez
}, 500);
```

### 4. **Loops de re-renderização**
```typescript
// ❌ RUIM - CRIA LOOP
const [clientes, setClientes] = useState([]);
const recarregar = useCallback(() => {
  setClientes([...novosDados]);
}, [clientes]); // Dependência do próprio estado!

// ✅ BOM - SEM LOOP
const recarregar = useCallback(() => {
  setClientes([...novosDados]);
}, []); // Sem dependências do estado
```

## 🛡️ REGRAS DE OURO

### Para useEffect:
- ✅ Use apenas **dependências primitivas** (string, number, boolean)
- ✅ Use **.length** em vez de arrays completos
- ✅ Evite **estados como dependência** do próprio useEffect

### Para useCallback/useMemo:
- ✅ Minimize dependências
- ✅ Use **.length** para arrays
- ✅ Não inclua estados que o callback modifica

### Para Context:
- ✅ Evite mudanças desnecessárias no value
- ✅ Use useMemo para estabilizar o value
- ✅ Não recarregue dados automaticamente

## 🔍 COMO IDENTIFICAR PISCAR

1. **Console.log excessivo**: Se há muitos logs repetitivos
2. **CPU alta**: Componente re-renderizando constantemente  
3. **Inputs que perdem foco**: Re-renderização durante digitação
4. **Loading que pisca**: Estados mudando muito rápido

## 📝 CHECKLIST ANTES DE COMMITAR

- [ ] Verifiquei todas as dependências de useEffect
- [ ] Usei .length em vez de arrays nas dependências
- [ ] Evitei loops de re-renderização
- [ ] Testei se a tela não está piscando
- [ ] Adicionei comentários preventivos no código

## 🚨 EMERGÊNCIA - TELA PISCANDO

Se a tela estiver piscando, verifique **IMEDIATAMENTE**:

1. **Último useEffect adicionado** - Provavelmente tem dependências ruins
2. **Dependências de useCallback** - Pode ter arrays ou estados instáveis  
3. **Chamadas de recarregamento** - Podem estar em loop
4. **Context values** - Podem estar mudando constantemente

---

**LEMBRE-SE: A tela pisca por RE-RENDERIZAÇÕES EXCESSIVAS!**

Sempre prefira **estabilidade** à **reatividade excessiva**.
