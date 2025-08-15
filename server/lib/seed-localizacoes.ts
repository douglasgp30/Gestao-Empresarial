import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedLocalizacoes() {
  console.log("🌱 Seed: Criando localizações geográficas de exemplo...");

  // Verificar se já existem dados
  const existentes = await prisma.localizacaoGeografica.findMany();
  if (existentes.length > 0) {
    console.log("✅ Seed: Localizações já existem, pulando seed");
    return;
  }

  // Criar cidades
  const cidades = [
    "São Paulo",
    "Rio de Janeiro", 
    "Belo Horizonte",
    "Brasília",
    "Curitiba",
    "Porto Alegre",
    "Salvador",
    "Fortaleza",
    "Recife",
  ];

  console.log("📍 Criando cidades...");
  for (const nomeCidade of cidades) {
    await prisma.localizacaoGeografica.create({
      data: {
        nome: nomeCidade,
        tipoItem: "cidade",
        ativo: true,
      },
    });
    console.log(`  ✅ Cidade criada: ${nomeCidade}`);
  }

  // Criar setores para algumas cidades
  const setoresPorCidade = {
    "São Paulo": [
      "Centro", "Vila Madalena", "Pinheiros", "Liberdade", "Brooklin",
      "Moema", "Itaim Bibi", "Jardins", "Vila Olímpia", "Santana"
    ],
    "Rio de Janeiro": [
      "Copacabana", "Ipanema", "Leblon", "Botafogo", "Tijuca",
      "Centro", "Barra da Tijuca", "Niterói", "Flamengo", "Lagoa"
    ],
    "Belo Horizonte": [
      "Centro", "Savassi", "Pampulha", "Lourdes", "Funcionários",
      "Santa Efigênia", "Barreiro", "Venda Nova"
    ],
  };

  console.log("🏢 Criando setores...");
  for (const [cidade, setores] of Object.entries(setoresPorCidade)) {
    for (const nomeSetor of setores) {
      await prisma.localizacaoGeografica.create({
        data: {
          nome: nomeSetor,
          tipoItem: "setor",
          cidade: cidade,
          ativo: true,
        },
      });
      console.log(`  ✅ Setor criado: ${nomeSetor} (${cidade})`);
    }
  }

  console.log("🎉 Seed de localizações concluído!");
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedLocalizacoes()
    .catch((e) => {
      console.error("❌ Erro no seed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
