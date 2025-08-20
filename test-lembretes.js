// Teste para reproduzir o problema dos lembretes
console.log("=== TESTE DE DEBUG DOS LEMBRETES ===");

// Simulando um agendamento às 13:00 com lembrete às 12:30
const dataAgendamento = new Date();
dataAgendamento.setHours(13, 0, 0, 0); // 13:00
console.log("Data/hora do agendamento:", dataAgendamento);

// Configuração do lembrete (30 minutos antes)
const tempoLembrete = 30; // minutos
const dataHoraLembrete = new Date(dataAgendamento);
dataHoraLembrete.setMinutes(dataHoraLembrete.getMinutes() - tempoLembrete);
console.log("Data/hora do lembrete calculada:", dataHoraLembrete);

// Verificar diferença
const agora = new Date();
console.log("Hora atual:", agora);

const diferencaMs = dataHoraLembrete.getTime() - agora.getTime();
const diferencaMinutos = Math.floor(diferencaMs / (1000 * 60));
console.log("Diferença em minutos:", diferencaMinutos);

// Teste da lógica de verificação (como no código)
console.log("Lembrete deve aparecer?", dataHoraLembrete <= agora);

// Simulando diferentes cenários
console.log("\n=== CENÁRIOS DE TESTE ===");

// Cenário 1: Lembrete futuro
const lembretesFuturo = new Date();
lembretesFuturo.setMinutes(lembretesFuturo.getMinutes() + 30);
console.log("Lembrete futuro (+30min):", lembretesFuturo <= agora, "| Hora:", lembretesFuturo);

// Cenário 2: Lembrete passado
const lembretePassado = new Date();
lembretePassado.setMinutes(lembretePassado.getMinutes() - 5);
console.log("Lembrete passado (-5min):", lembretePassado <= agora, "| Hora:", lembretePassado);

// Cenário 3: Teste do timezone
console.log("\n=== TIMEZONE INFO ===");
console.log("Timezone offset:", agora.getTimezoneOffset());
console.log("Timezone string:", Intl.DateTimeFormat().resolvedOptions().timeZone);
