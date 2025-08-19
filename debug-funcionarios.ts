// Script para debugar funcionários no localStorage

function debugFuncionarios() {
  console.log('🔍 Debugando funcionários...');
  
  try {
    // Verificar localStorage
    const funcionariosStorage = localStorage.getItem('funcionarios');
    
    if (!funcionariosStorage) {
      console.log('❌ Nenhum funcionário encontrado no localStorage');
      return;
    }

    const funcionarios = JSON.parse(funcionariosStorage);
    console.log(`📊 Total de funcionários no localStorage: ${funcionarios.length}`);
    
    funcionarios.forEach((func: any, index: number) => {
      console.log(`${index + 1}. ${func.nomeCompleto || func.nome} (ID: ${func.id})`);
      console.log(`   - Login: ${func.login || 'Sem login'}`);
      console.log(`   - Tipo: ${func.tipoAcesso}`);
      console.log(`   - Ativo: ${func.ativo}`);
      console.log(`   - Permissão Acesso: ${func.permissaoAcesso || func.temAcessoSistema}`);
      console.log(`   - Data Cadastro: ${func.dataCadastro || func.dataCriacao}`);
      console.log('   ---');
    });

    // Verificar se há funcionários duplicados
    const ids = funcionarios.map((f: any) => f.id);
    const idsUnicos = [...new Set(ids)];
    
    if (ids.length !== idsUnicos.length) {
      console.log('⚠️ ATENÇÃO: Há funcionários duplicados!');
      const duplicados = ids.filter((id: any, index: number) => ids.indexOf(id) !== index);
      console.log('IDs duplicados:', duplicados);
    } else {
      console.log('✅ Não há funcionários duplicados');
    }

    // Verificar estrutura dos dados
    const primeiroFuncionario = funcionarios[0];
    console.log('\n📋 Estrutura do primeiro funcionário:');
    console.log(Object.keys(primeiroFuncionario));

  } catch (error) {
    console.error('❌ Erro ao debugar funcionários:', error);
  }
}

// Função para limpar funcionários duplicados
function limparDuplicados() {
  try {
    const funcionariosStorage = localStorage.getItem('funcionarios');
    
    if (!funcionariosStorage) {
      console.log('❌ Nenhum funcionário encontrado');
      return;
    }

    const funcionarios = JSON.parse(funcionariosStorage);
    
    // Remover duplicados baseado no ID
    const funcionariosUnicos = funcionarios.filter((func: any, index: number, arr: any[]) => {
      return arr.findIndex(f => f.id === func.id) === index;
    });

    if (funcionarios.length !== funcionariosUnicos.length) {
      console.log(`🧹 Removendo ${funcionarios.length - funcionariosUnicos.length} funcionários duplicados`);
      localStorage.setItem('funcionarios', JSON.stringify(funcionariosUnicos));
      console.log('✅ Duplicados removidos');
    } else {
      console.log('✅ Não há duplicados para remover');
    }

  } catch (error) {
    console.error('❌ Erro ao limpar duplicados:', error);
  }
}

// Função para forçar atualização
function forcarAtualizacao() {
  try {
    console.log('🔄 Forçando atualização...');
    
    // Disparar evento customizado para forçar recarregamento
    window.dispatchEvent(new CustomEvent('funcionarios-updated'));
    
    // Recarregar a página se necessário
    setTimeout(() => {
      if (confirm('Recarregar a página para aplicar mudanças?')) {
        window.location.reload();
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erro ao forçar atualização:', error);
  }
}

// Executar debug
debugFuncionarios();

// Disponibilizar funções globalmente para uso no console
(window as any).debugFuncionarios = debugFuncionarios;
(window as any).limparDuplicados = limparDuplicados;
(window as any).forcarAtualizacao = forcarAtualizacao;

console.log('💡 Funções disponíveis:');
console.log('- debugFuncionarios() - Mostra detalhes dos funcionários');
console.log('- limparDuplicados() - Remove funcionários duplicados');
console.log('- forcarAtualizacao() - Força atualização da interface');
