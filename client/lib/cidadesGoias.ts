/**
 * Lista das cidades de Goiás fornecida pelo usuário
 * Para ser preservada durante limpezas do sistema
 */

export const cidadesGoias = [
  "Aparecida de Goiânia",
  "Senador Canedo",
  "Trindade",
  "Abadia de Goiás",
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
  "Serranópolis",
  "Silvânia",
  "Simolândia",
  "Sítio d'Abadia",
  "Taquaral de Goiás",
  "Teresina de Goiás",
  "Terezópolis de Goiás",
  "Três Ranchos",
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

/**
 * Função para verificar se as cidades de Goiás estão salvas no localStorage
 * e garantir que sejam preservadas durante limpezas
 */
export const garantirCidadesGoias = () => {
  try {
    const localizacoesExistentes = localStorage.getItem(
      "localizacoes_geograficas",
    );

    if (!localizacoesExistentes) {
      console.log(
        "🏙️ [CidadesGoias] Criando localizações geográficas iniciais...",
      );

      const localizacoesGoias = cidadesGoias.map((cidade, index) => ({
        id: index + 1,
        nome: cidade,
        tipoItem: "cidade" as const,
        ativo: true,
        dataCriacao: new Date(),
      }));

      localStorage.setItem(
        "localizacoes_geograficas",
        JSON.stringify(localizacoesGoias),
      );
      console.log(
        `✅ [CidadesGoias] ${cidadesGoias.length} cidades de Goiás salvas!`,
      );

      return localizacoesGoias;
    } else {
      const localizacoesParsed = JSON.parse(localizacoesExistentes);
      console.log(
        `🏙️ [CidadesGoias] ${localizacoesParsed.length} localizações já existem no sistema`,
      );
      return localizacoesParsed;
    }
  } catch (error) {
    console.error("❌ [CidadesGoias] Erro ao garantir cidades:", error);
    return [];
  }
};

/**
 * Função para verificar se uma cidade específica existe nas localizações
 */
export const verificarCidadeExiste = (nomeCidade: string): boolean => {
  try {
    const localizacoes = localStorage.getItem("localizacoes_geograficas");
    if (!localizacoes) return false;

    const localizacoesParsed = JSON.parse(localizacoes);
    return localizacoesParsed.some(
      (loc: any) =>
        loc.nome.toLowerCase() === nomeCidade.toLowerCase() &&
        loc.tipoItem === "cidade",
    );
  } catch (error) {
    console.error("❌ [CidadesGoias] Erro ao verificar cidade:", error);
    return false;
  }
};
