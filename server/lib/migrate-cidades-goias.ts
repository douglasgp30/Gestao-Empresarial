import { prisma } from "./database";

// Lista completa das cidades de Goiás (conforme fornecida pelo usuário)
const cidadesGoias = [
  "Abadia de Goiás",
  "Aparecida de Goiânia",
  "Aragoiania",
  "Aruanã",
  "Caldas Novas",
  "Cezarina",
  "Cristalina",
  "Divinópolis de Goiás",
  "Fazenda Nova",
  "Formosa",
  "Formoso",
  "Gameleira de Goiás",
  "Goianápolis",
  "Goiandira",
  "Goianésia",
  "Goiânia",
  "Goiatuba",
  "Gouvelândia",
  "Guapó",
  "Guaraíta",
  "Guarani de Goiás",
  "Guarinos",
  "Heitoraí",
  "Hidrolândia",
  "Hidrolina",
  "Iaciara",
  "Inaciolândia",
  "Indiara",
  "Inhumas",
  "Ipameri",
  "Ipiranga de Goiás",
  "Iporá",
  "Israelândia",
  "Itaberaí",
  "Itaguari",
  "Itaguaru",
  "Itajá",
  "Itapaci",
  "Itapirapuã",
  "Itapuranga",
  "Itarumã",
  "Itauçu",
  "Itumbiara",
  "Ivolândia",
  "Jandaia",
  "Jaraguá",
  "Jataí",
  "Jaupaci",
  "Jesúpolis",
  "Joviânia",
  "Jussara",
  "Lagoa Santa",
  "Leopoldo de Bulhões",
  "Luziânia",
  "Mairipotaba",
  "Mambaí",
  "Mara Rosa",
  "Marzagão",
  "Matrinchã",
  "Maurilândia",
  "Mimoso de Goiás",
  "Minacu",
  "Mineiros",
  "Moiporá",
  "Monte Alegre de Goiás",
  "Montes Claros de Goiás",
  "Montividiu",
  "Montividiu do Norte",
  "Morrinhos",
  "Morro Agudo de Goiás",
  "Mossâmedes",
  "Mozarlândia",
  "Mundo Novo",
  "Mutunópolis",
  "Nazário",
  "Nerópolis",
  "Niquelândia",
  "Nova América",
  "Nova Aurora",
  "Nova Crixás",
  "Nova Glória",
  "Nova Iguaçu de Goiás",
  "Nova Roma",
  "Nova Veneza",
  "Novo Brasil",
  "Novo Gama",
  "Novo Planalto",
  "Orizona",
  "Ouro Verde de Goiás",
  "Ouvidor",
  "Padre Bernardo",
  "Palestina de Goiás",
  "Palmeiras de Goiás",
  "Palmelo",
  "Palminópolis",
  "Panamá",
  "Paranaiguara",
  "Paraúna",
  "Perolândia",
  "Petrolina de Goiás",
  "Portelândia",
  "Posse",
  "Professor Jamil",
  "Quirinópolis",
  "Rialma",
  "Rianápolis",
  "Rio Quente",
  "Rio Verde",
  "Rubiataba",
  "Sanclerlândia",
  "Santa Bárbara de Goiás",
  "Santa Cruz de Goiás",
  "Santa Fé de Goiás",
  "Santa Helena de Goiás",
  "Santa Isabel",
  "Santa Rita do Araguaia",
  "Santa Rita do Novo Destino",
  "Santa Rosa de Goiás",
  "Santa Tereza de Goiás",
  "Santa Terezinha de Goiás",
  "Santo Antônio da Barra",
  "Santo Antônio de Goiás",
  "Santo Antônio do Descoberto",
  "São Domingos",
  "São Francisco de Goiás",
  "São João D'Aliança",
  "São João da Paraúna",
  "São Luís de Montes Belos",
  "São Luíz do Norte",
  "São Miguel do Araguaia",
  "São Miguel do Passa Quatro",
  "São Patrício",
  "São Simão",
  "Senador Canedo",
  "Serranópolis",
  "Silvânia",
  "Simolândia",
  "Sítio d'Abadia",
  "Taquaral de Goiás",
  "Teresina de Goiás",
  "Terezópolis de Goiás",
  "Três Ranchos",
  "Trindade",
  "Trombas",
  "Turvânia",
  "Turvelândia",
  "Uirapuru",
  "Uruaçu",
  "Uruana",
  "Urutaí",
  "Valparaíso de Goiás",
  "Varjão",
  "Vianópolis",
  "Vicentinópolis",
  "Vila Boa",
  "Vila Propício",
];

export async function migrateCidadesGoias() {
  console.log("[Migração] Iniciando migração para cidades de Goiás...");

  try {
    // 1. Fazer limpeza completa da tabela de localizações geográficas
    console.log("[Migração] Fazendo limpeza completa dos dados existentes...");
    
    // Remover todos os registros existentes
    await prisma.lancamentoCaixa.updateMany({
      where: {
        localizacaoId: {
          not: null,
        },
      },
      data: {
        localizacaoId: null,
      },
    });

    await prisma.agendamento.updateMany({
      where: {
        localizacaoId: {
          not: null,
        },
      },
      data: {
        localizacaoId: null,
      },
    });

    await prisma.contaLancamento.updateMany({
      where: {
        localizacaoId: {
          not: null,
        },
      },
      data: {
        localizacaoId: null,
      },
    });

    // Agora podemos deletar todas as localizações
    const deletedCount = await prisma.localizacaoGeografica.deleteMany({});
    console.log(`[Migração] Removidos ${deletedCount.count} registros antigos`);

    // 2. Inserir todas as cidades de Goiás como inativas
    console.log("[Migração] Inserindo cidades de Goiás...");
    
    const cidadesParaInserir = cidadesGoias.map((nomeCidade) => ({
      nome: nomeCidade,
      tipoItem: "cidade",
      cidade: null,
      ativo: false, // Todas desativadas por padrão
    }));

    await prisma.localizacaoGeografica.createMany({
      data: cidadesParaInserir,
    });

    console.log(`[Migração] ${cidadesGoias.length} cidades de Goiás inseridas com sucesso!`);
    console.log("[Migração] Todas as cidades foram cadastradas como INATIVAS por padrão");
    console.log("[Migração] Para usar uma cidade, você deve marcá-la como ATIVA no sistema");

    // 3. Verificar resultado
    const cidadesInseridas = await prisma.localizacaoGeografica.findMany({
      where: { tipoItem: "cidade" },
      orderBy: { nome: "asc" },
    });

    console.log(`[Migração] Verificação: ${cidadesInseridas.length} cidades no banco`);
    console.log(`[Migração] Primeiras 5 cidades: ${cidadesInseridas.slice(0, 5).map(c => c.nome).join(", ")}`);

    return {
      success: true,
      cidadesInseridas: cidadesInseridas.length,
      primeirasCidades: cidadesInseridas.slice(0, 5).map(c => c.nome),
    };

  } catch (error) {
    console.error("[Migração] Erro na migração:", error);
    throw error;
  }
}

export async function ativarCidade(nomeCidade: string) {
  console.log(`[Migra��ão] Ativando cidade: ${nomeCidade}`);
  
  try {
    const resultado = await prisma.localizacaoGeografica.updateMany({
      where: {
        nome: nomeCidade,
        tipoItem: "cidade",
      },
      data: {
        ativo: true,
      },
    });

    if (resultado.count === 0) {
      throw new Error(`Cidade "${nomeCidade}" não encontrada`);
    }

    console.log(`[Migração] Cidade "${nomeCidade}" ativada com sucesso`);
    return { success: true, cidade: nomeCidade };
  } catch (error) {
    console.error(`[Migração] Erro ao ativar cidade "${nomeCidade}":`, error);
    throw error;
  }
}

export async function listarCidadesAtivas() {
  const cidadesAtivas = await prisma.localizacaoGeografica.findMany({
    where: {
      tipoItem: "cidade",
      ativo: true,
    },
    orderBy: { nome: "asc" },
  });

  return cidadesAtivas;
}

export async function listarTodasCidades() {
  const todasCidades = await prisma.localizacaoGeografica.findMany({
    where: {
      tipoItem: "cidade",
    },
    orderBy: { nome: "asc" },
  });

  return todasCidades;
}
