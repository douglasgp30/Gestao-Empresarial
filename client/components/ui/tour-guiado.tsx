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
    titulo: "Bem-vindo ao seu Sistema de Gestão!",
    descricao:
      "Vamos fazer um tour rápido para te ajudar a conhecer as principais funcionalidades do sistema.",
    icone: <CheckCircle className="w-6 h-6 text-green-600" />,
  },
  {
    id: "dashboard",
    titulo: "Dashboard Principal",
    descricao:
      "Aqui você tem uma visão geral do seu negócio: receitas, despesas, agendamentos e muito mais.",
    icone: <BarChart3 className="w-6 h-6 text-blue-600" />,
    seletor: '[data-tour="dashboard"]',
  },
  {
    id: "caixa",
    titulo: "Controle de Caixa",
    descricao:
      "Registre todas as receitas e despesas da sua empresa. Mantenha o controle financeiro em dia!",
    icone: <DollarSign className="w-6 h-6 text-green-600" />,
    seletor: '[data-tour="caixa"]',
  },
  {
    id: "funcionarios",
    titulo: "Gestão de Funcionários",
    descricao:
      "Cadastre técnicos e funcionários, configure permissões e controle comissões.",
    icone: <Users className="w-6 h-6 text-purple-600" />,
    seletor: '[data-tour="funcionarios"]',
  },
  {
    id: "agendamentos",
    titulo: "Agendamentos",
    descricao:
      "Organize a agenda da sua empresa e nunca perca um compromisso importante.",
    icone: <Calendar className="w-6 h-6 text-orange-600" />,
    seletor: '[data-tour="agendamentos"]',
  },
  {
    id: "configuracoes",
    titulo: "Configurações",
    descricao:
      "Personalize o sistema, faça backups e acesse os logs de auditoria.",
    icone: <Settings className="w-6 h-6 text-gray-600" />,
    seletor: '[data-tour="configuracoes"]',
  },
  {
    id: "final",
    titulo: "Pronto para começar!",
    descricao:
      "Agora você já conhece as principais funcionalidades. Explore o sistema e comece a gerenciar seu negócio!",
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

            <div className="flex space-x-2 mx-4">
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
