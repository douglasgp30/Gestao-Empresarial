import { migrateCidadesGoias } from './server/lib/migrate-cidades-goias';

async function executarRestauracaoCidades() {
  console.log('🏙️ Restaurando cidades de Goiás...');
  
  try {
    const resultado = await migrateCidadesGoias();
    
    console.log('✅ Cidades restauradas com sucesso!');
    console.log(`📊 ${resultado.cidadesInseridas} cidades inseridas`);
    console.log(`🔗 Primeiras cidades: ${resultado.primeirasCidades?.join(', ')}`);
    
    // Ativar as principais cidades por padrão
    const cidadesPrincipais = [
      'Goiânia',
      'Aparecida de Goiânia', 
      'Senador Canedo',
      'Trindade',
      'Anápolis',
      'Rio Verde',
      'Luziânia',
      'Águas Lindas de Goiás'
    ];

    console.log('\n🔄 Ativando cidades principais...');
    const { ativarCidade } = await import('./server/lib/migrate-cidades-goias');
    
    for (const cidade of cidadesPrincipais) {
      try {
        await ativarCidade(cidade);
        console.log(`✅ ${cidade} ativada`);
      } catch (error) {
        console.log(`⚠️ Não foi possível ativar ${cidade} (pode não existir na lista)`);
      }
    }
    
    console.log('\n🎉 Restauração concluída!');
    console.log('💡 Para ativar outras cidades, acesse o sistema e vá em "Gerenciar Cidades e Setores"');
    
  } catch (error) {
    console.error('❌ Erro ao restaurar cidades:', error);
  }
}

// Executar automaticamente
executarRestauracaoCidades().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Falha na execução:', error);
  process.exit(1);
});

export default executarRestauracaoCidades;
