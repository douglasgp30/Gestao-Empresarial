// Script para debugar filtros de data
const hoje = new Date();
const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
const fimAno = new Date(hoje.getFullYear() + 1, 11, 31);
inicioMes.setHours(0, 0, 0, 0);
fimAno.setHours(23, 59, 59, 999);

console.log('📅 Debug dos filtros de data:');
console.log('Hoje:', hoje.toISOString());
console.log('Início do mês:', inicioMes.toISOString());
console.log('Fim do próximo ano:', fimAno.toISOString());
console.log('');

console.log('Filtros que serão enviados para API:');
console.log('dataInicio:', inicioMes.toISOString().split('T')[0]);
console.log('dataFim:', fimAno.toISOString().split('T')[0]);
console.log('');

console.log('Contas de teste que deveriam aparecer:');
console.log('- 2024-08-10 (Conta de energia - pago) ❌ FORA DO RANGE');
console.log('- 2024-08-15 (Serviço consultoria - pendente) ❌ FORA DO RANGE');
console.log('- 2024-08-20 (Aluguel escritório - pendente) ❌ FORA DO RANGE');
console.log('- 2025-08-15 (Contas Douglas - pendente) ✅ DENTRO DO RANGE');
console.log('');

console.log('🔍 PROBLEMA IDENTIFICADO:');
console.log('As contas de teste de 2024 estão FORA do range que começa em', inicioMes.toISOString().split('T')[0]);
console.log('Só aparecem as contas de 2025 para frente!');
