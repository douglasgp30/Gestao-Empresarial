import { Funcionario } from "../../shared/types";

// Exemplo de funcionários com diferentes configurações de ponto
export const exemplosFuncionarios: Partial<Funcionario>[] = [
  {
    id: "exemplo-1",
    nome: "Maria Silva",
    cargo: "Desenvolvedora",
    registraPonto: true,
    jornadaDiaria: 8.0,
    temAcessoSistema: true,
    tipoAcesso: "Operador",
    ativo: true,
    permissaoAcesso: true,
    nomeCompleto: "Maria Silva Santos",
    dataCadastro: new Date('2024-01-15')
  },
  {
    id: "exemplo-2", 
    nome: "João Santos",
    cargo: "Designer",
    registraPonto: true,
    jornadaDiaria: 6.0, // Meio período
    temAcessoSistema: true,
    tipoAcesso: "Operador",
    ativo: true,
    permissaoAcesso: true,
    nomeCompleto: "João Santos Oliveira",
    dataCadastro: new Date('2024-02-01')
  },
  {
    id: "exemplo-3",
    nome: "Ana Costa",
    cargo: "Gerente de Projetos", 
    registraPonto: true,
    jornadaDiaria: 9.0, // Jornada estendida
    temAcessoSistema: true,
    tipoAcesso: "Administrador",
    ativo: true,
    permissaoAcesso: true,
    nomeCompleto: "Ana Costa Ferreira",
    dataCadastro: new Date('2024-01-10')
  },
  {
    id: "exemplo-4",
    nome: "Carlos Lima",
    cargo: "Estagiário",
    registraPonto: true,
    jornadaDiaria: 4.0, // Estágio meio período
    temAcessoSistema: false,
    tipoAcesso: "Técnico",
    ativo: true,
    permissaoAcesso: false,
    nomeCompleto: "Carlos Lima da Silva",
    dataCadastro: new Date('2024-03-01')
  }
];

// Função para adicionar funcionários de exemplo ao localStorage
export function adicionarExemplosFuncionarios(): void {
  try {
    const funcionariosExistentes = localStorage.getItem('funcionarios');
    let funcionarios = funcionariosExistentes ? JSON.parse(funcionariosExistentes) : [];
    
    // Verificar se os exemplos já existem
    const idsExistentes = funcionarios.map((f: any) => f.id);
    const novosExemplos = exemplosFuncionarios.filter(f => !idsExistentes.includes(f.id));
    
    if (novosExemplos.length > 0) {
      funcionarios = [...funcionarios, ...novosExemplos];
      localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
      console.log(`${novosExemplos.length} funcionários de exemplo adicionados ao localStorage`);
    } else {
      console.log('Funcionários de exemplo já existem no localStorage');
    }
  } catch (error) {
    console.error('Erro ao adicionar funcionários de exemplo:', error);
  }
}

// Função para remover funcionários de exemplo
export function removerExemplosFuncionarios(): void {
  try {
    const funcionariosExistentes = localStorage.getItem('funcionarios');
    if (!funcionariosExistentes) return;
    
    let funcionarios = JSON.parse(funcionariosExistentes);
    const idsExemplos = exemplosFuncionarios.map(f => f.id);
    
    funcionarios = funcionarios.filter((f: any) => !idsExemplos.includes(f.id));
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
    
    console.log('Funcionários de exemplo removidos do localStorage');
  } catch (error) {
    console.error('Erro ao remover funcionários de exemplo:', error);
  }
}

// Verificar se há funcionários de exemplo
export function temExemplosFuncionarios(): boolean {
  try {
    const funcionariosExistentes = localStorage.getItem('funcionarios');
    if (!funcionariosExistentes) return false;
    
    const funcionarios = JSON.parse(funcionariosExistentes);
    const idsExemplos = exemplosFuncionarios.map(f => f.id);
    
    return funcionarios.some((f: any) => idsExemplos.includes(f.id));
  } catch (error) {
    console.error('Erro ao verificar funcionários de exemplo:', error);
    return false;
  }
}
