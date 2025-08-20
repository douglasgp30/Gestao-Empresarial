import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import {
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle,
  Users,
  DollarSign,
  Calendar,
  Settings,
  BarChart3,
  FileText,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface TooltipPosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

interface EtapaTour {
  id: string;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  posicao?: TooltipPosition;
  seletor?: string; // CSS selector do elemento a destacar
  acao?: string; // Ação que o usuário deve fazer
}

const etapasDoTour: EtapaTour[] = [
  {
    id: "boas-vindas",
    titulo: "Bem-vindo ao seu Sistema de Gestão Completo!",
    descricao:
      "Vamos fazer um tour completo para te ajudar a conhecer TODAS as funcionalidades do sistema. Este tour cobrirá cada módulo em detalhes.",
    icone: <CheckCircle className="w-6 h-6 text-green-600" />,
  },
  {
    id: "dashboard",
    titulo: "Dashboard - Centro de Controle",
    descricao:
      "Aqui está o coração do sistema! Visualize receitas, despesas, metas mensais, contas a vencer e saldos gerais. É sua central de monitoramento financeiro.",
    icone: <BarChart3 className="w-6 h-6 text-blue-600" />,
    seletor: '[data-tour="dashboard"]',
    acao: "Defina sua meta mensal e acompanhe o progresso em tempo real.",
  },
  {
    id: "caixa",
    titulo: "Controle de Caixa - Fluxo Financeiro",
    descricao:
      "Registre TODAS as receitas e despesas da empresa. Crie campanhas para rastrear origem das receitas, gerencie clientes e mantenha controle total das finanças.",
    icone: <DollarSign className="w-6 h-6 text-green-600" />,
    seletor: '[data-tour="caixa"]',
    acao: "Use os botões 'Nova Receita' e 'Nova Despesa' para registrar movimentações.",
  },
  {
    id: "contas",
    titulo: "Contas a Pagar e Receber",
    descricao:
      "Gerencie compromissos financeiros futuros. Controle contas a pagar (fornecedores) e a receber (clientes), nunca perca prazos importantes!",
    icone: <FileText className="w-6 h-6 text-orange-600" />,
    seletor: '[data-tour="contas"]',
    acao: "Cadastre contas com vencimentos para manter organização financeira.",
  },
  {
    id: "campanhas",
    titulo: "Campanhas de Marketing",
    descricao:
      "Analise o desempenho das suas campanhas de marketing. Veja receitas por campanha, número de lançamentos e ROI das suas estratégias.",
    icone: <BarChart3 className="w-6 h-6 text-purple-600" />,
    seletor: '[data-tour="campanhas"]',
    acao: "Campanhas são criadas automaticamente quando você registra receitas no Caixa.",
  },
  {
    id: "clientes",
    titulo: "Gestão de Clientes - CRM",
    descricao:
      "Cadastre e gerencie todos os seus clientes. Visualize histórico completo de serviços, gastos totais e informações de contato organizadas.",
    icone: <Users className="w-6 h-6 text-blue-600" />,
    seletor: '[data-tour="clientes"]',
    acao: "Use a busca para encontrar clientes rapidamente por nome, CPF, telefone ou email.",
  },
  {
    id: "agendamentos",
    titulo: "Sistema de Agendamentos",
    descricao:
      "Organize a agenda da empresa com sistema completo de agendamentos. Configure lembretes automáticos e nunca perca compromissos importantes!",
    icone: <Calendar className="w-6 h-6 text-orange-600" />,
    seletor: '[data-tour="agendamentos"]',
    acao: "Filtre por período, status, setor e técnico para organizar a agenda.",
  },
  {
    id: "funcionarios",
    titulo: "Gestão de Funcionários e Técnicos",
    descricao:
      "Cadastre funcionários e técnicos, configure permissões de acesso, defina comissões e gerencie toda a equipe da empresa.",
    icone: <Users className="w-6 h-6 text-purple-600" />,
    seletor: '[data-tour="funcionarios"]',
    acao: "Configure diferentes níveis de acesso: Admin, Técnico ou Funcionário comum.",
  },
  {
    id: "ponto",
    titulo: "Controle de Ponto Eletrônico",
    descricao:
      "Sistema completo de controle de ponto! Funcionários batem ponto, administradores gerenciam horários e geram relatórios de presença.",
    icone: <Calendar className="w-6 h-6 text-indigo-600" />,
    seletor: '[data-tour="ponto"]',
    acao: "Funcionários usam 'Bater Ponto', administradores acessam 'Gerenciar Pontos'.",
  },
  {
    id: "relatorios",
    titulo: "Relatórios e Analytics",
    descricao:
      "Gere relatórios completos: financeiros, de técnicos, de contas. Analise dados com gráficos e tome decisões baseadas em informações precisas.",
    icone: <BarChart3 className="w-6 h-6 text-green-600" />,
    seletor: '[data-tour="relatorios"]',
    acao: "Use os filtros de data para analisar períodos específicos nos relatórios.",
  },
  {
    id: "configuracoes",
    titulo: "Configurações do Sistema",
    descricao:
      "Configure a empresa, personalize aparência (tema escuro/claro), gerencie usuários, configure backups automáticos e acesse logs de auditoria.",
    icone: <Settings className="w-6 h-6 text-gray-600" />,
    seletor: '[data-tour="configuracoes"]',
    acao: "Explore as abas: Empresa, Aparência, Usuários, Sistema, Backup e Auditoria.",
  },
  {
    id: "navegacao",
    titulo: "Navegação e Menu Principal",
    descricao:
      "Use o menu lateral para navegar entre os módulos. Cada seção tem filtros, listagens e formulários específicos para suas necessidades.",
    icone: <ArrowRight className="w-6 h-6 text-blue-600" />,
    acao: "O menu sempre estará disponível para navegação rápida entre módulos.",
  },
  {
    id: "integracao",
    titulo: "Integração Entre Módulos",
    descricao:
      "Os módulos trabalham juntos! Receitas do Caixa aparecem no Dashboard, clientes do Caixa são listados em Clientes, funcionários do módulo Funcionários aparecem no Ponto.",
    icone: <CheckCircle className="w-6 h-6 text-purple-600" />,
    acao: "Dados são compartilhados automaticamente entre os módulos para máxima eficiência.",
  },
  {
    id: "dicas-uso",
    titulo: "Dicas de Uso Eficiente",
    descricao:
      "Use filtros de data em cada módulo, configure metas no Dashboard, ative backups automáticos, e acompanhe os totais regularmente para máximo controle.",
    icone: <Settings className="w-6 h-6 text-orange-600" />,
    acao: "Estabeleça uma rotina: registre movimentações diárias e consulte relatórios semanalmente.",
  },
  {
    id: "final",
    titulo: "Sistema Completo Apresentado!",
    descricao:
      "Parabéns! Agora você conhece TODO o sistema. Comece pelo Dashboard, registre suas primeiras movimentações no Caixa e explore cada módulo conforme sua necessidade!",
    icone: <CheckCircle className="w-6 h-6 text-green-600" />,
  },
];

interface TourGuiadoProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function TourGuiado({ onClose, onComplete }: TourGuiadoProps) {
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [posicaoTooltip, setPosicaoTooltip] = useState<TooltipPosition>({});

  const etapa = etapasDoTour[etapaAtual];
  const isUltimaEtapa = etapaAtual === etapasDoTour.length - 1;
  const isPrimeiraEtapa = etapaAtual === 0;

  useEffect(() => {
    // Calcular posição do tooltip baseado no seletor da etapa
    if (etapa.seletor) {
      const elemento = document.querySelector(etapa.seletor);
      if (elemento) {
        const rect = elemento.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft =
          window.pageXOffset || document.documentElement.scrollLeft;

        setPosicaoTooltip({
          top: rect.bottom + scrollTop + 10,
          left: rect.left + scrollLeft,
        });

        // Destacar o elemento
        elemento.classList.add("tour-highlight");

        // Scroll suave para o elemento
        elemento.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      // Centralizar tooltip
      setPosicaoTooltip({
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 200,
      });
    }

    // Cleanup: remover highlights anteriores
    return () => {
      document.querySelectorAll(".tour-highlight").forEach((el) => {
        el.classList.remove("tour-highlight");
      });
    };
  }, [etapaAtual, etapa.seletor]);

  const proximaEtapa = () => {
    if (isUltimaEtapa) {
      completarTour();
    } else {
      setEtapaAtual((prev) => prev + 1);
    }
  };

  const etapaAnterior = () => {
    if (!isPrimeiraEtapa) {
      setEtapaAtual((prev) => prev - 1);
    }
  };

  const pularTour = () => {
    onClose();
  };

  const completarTour = () => {
    onComplete();
  };

  return (
    <>
      {/* Overlay escuro */}
      <div className="fixed inset-0 bg-black/50 z-40" />

      {/* CSS para destacar elementos */}
      <style>
        {`
          .tour-highlight {
            position: relative;
            z-index: 45 !important;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5) !important;
            border-radius: 8px;
          }
        `}
      </style>

      {/* Tooltip do tour */}
      <Card
        className="fixed z-50 w-96 shadow-2xl"
        style={{
          top: posicaoTooltip.top,
          left: posicaoTooltip.left,
          right: posicaoTooltip.right,
          bottom: posicaoTooltip.bottom,
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {etapa.icone}
              <div>
                <CardTitle className="text-lg">{etapa.titulo}</CardTitle>
                <Badge variant="outline" className="mt-1">
                  {etapaAtual + 1} de {etapasDoTour.length}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={pularTour}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <CardDescription className="text-sm leading-relaxed">
            {etapa.descricao}
          </CardDescription>

          {etapa.acao && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> {etapa.acao}
              </p>
            </div>
          )}

          {/* Navegação */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              onClick={etapaAnterior}
              disabled={isPrimeiraEtapa}
              className={cn(isPrimeiraEtapa && "invisible")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            <div className="flex space-x-2 ml-2 mr-6">
              {etapasDoTour.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === etapaAtual ? "bg-primary" : "bg-gray-300",
                  )}
                />
              ))}
            </div>

            <Button onClick={proximaEtapa}>
              {isUltimaEtapa ? (
                <>
                  Finalizar
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Opção de pular */}
          <div className="text-center pt-2 border-t">
            <Button
              variant="link"
              size="sm"
              onClick={pularTour}
              className="text-xs"
            >
              Pular tour e explorar por conta própria
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Hook para controlar o tour
export function useTourGuiado() {
  const [mostrarTour, setMostrarTour] = useState(false);

  const iniciarTour = () => {
    setMostrarTour(true);
  };

  const fecharTour = () => {
    setMostrarTour(false);
    // Marcar que o tour foi visualizado
    localStorage.setItem("tour_visualizado", "true");
  };

  const completarTour = () => {
    setMostrarTour(false);
    // Marcar que o tour foi completado
    localStorage.setItem("tour_completo", "true");
    localStorage.setItem("tour_visualizado", "true");
  };

  const verificarSeDeveExibirTour = (): boolean => {
    const tourJaVisualizado = localStorage.getItem("tour_visualizado");
    const primeiroAcesso = localStorage.getItem("primeiro_acesso_completo");

    // Exibir tour apenas se for primeiro acesso e não foi visualizado ainda
    return !tourJaVisualizado && primeiroAcesso === "true";
  };

  return {
    mostrarTour,
    iniciarTour,
    fecharTour,
    completarTour,
    verificarSeDeveExibirTour,
  };
}
