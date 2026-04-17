import React from "react";

interface State {
  hasError: boolean;
  message?: string;
}

export default class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || "Erro inesperado" };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("❌ [AppErrorBoundary] Erro de renderização:", error);
    console.error("❌ [AppErrorBoundary] Stack:", errorInfo.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white border rounded-xl shadow-sm p-6 space-y-4 text-center">
          <h1 className="text-xl font-semibold text-red-600">Ops! Ocorreu um erro na tela.</h1>
          <p className="text-sm text-slate-600">
            Não se preocupe. Você pode recarregar a página para continuar.
          </p>
          {this.state.message && (
            <p className="text-xs text-slate-500 break-words">
              Detalhe técnico: {this.state.message}
            </p>
          )}
          <button
            type="button"
            onClick={this.handleReload}
            className="w-full bg-slate-900 text-white rounded-md px-4 py-2 hover:bg-slate-800"
          >
            Recarregar página
          </button>
        </div>
      </div>
    );
  }
}
