import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

export function LimparLocalStorage() {
  const limparLocalStorage = () => {
    // Limpar dados específicos dos funcionários e categorias/descrições
    localStorage.removeItem('funcionarios');
    localStorage.removeItem('descricoes_e_categorias');
    
    console.log("🧹 LocalStorage limpo: funcionarios e descricoes_e_categorias removidos");
    
    // Recarregar a página para refletir as mudanças
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Trash2 className="h-5 w-5" />
          Limpar LocalStorage (Dados Fictícios)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="text-sm text-yellow-800">
            <strong>⚠️ Atenção:</strong> Este botão remove dados fictícios do localStorage para completar a limpeza do banco de dados.
          </div>
        </div>

        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <h4 className="font-medium text-red-800 mb-1">🗑️ O que será removido:</h4>
          <div className="text-sm text-red-700 space-y-1">
            <div>• Cache de funcionários fictícios</div>
            <div>• Cache de descrições/categorias fictícias</div>
            <div>• A página será recarregada automaticamente</div>
          </div>
        </div>

        <Button 
          onClick={limparLocalStorage}
          variant="destructive"
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar Cache Local e Recarregar
        </Button>
      </CardContent>
    </Card>
  );
}
