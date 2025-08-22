import React, { useState, useEffect } from "react";
import { useCurrencyInput } from "../hooks/use-currency-input";
import { useEntidades } from "../contexts/EntidadesContext";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function TestePage() {
  const valorInput = useCurrencyInput();
  const { formasPagamento } = useEntidades();
  const [selectedFormaPagamento, setSelectedFormaPagamento] = useState("");

  console.log("TestePage - Formas de pagamento carregadas:", formasPagamento);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Página de Teste - Debug</h1>
      
      {/* Teste do Currency Input */}
      <Card>
        <CardHeader>
          <CardTitle>Teste Currency Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valor-teste">Valor (R$)</Label>
            <Input
              id="valor-teste"
              {...valorInput.inputProps}
              placeholder="Digite um valor"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Valores Calculados:</Label>
            <div className="bg-gray-100 p-3 rounded text-sm space-y-1">
              <div>Display Value: {valorInput.displayValue}</div>
              <div>Numeric Value: {valorInput.numericValue}</div>
              <div>Formatted: R$ {valorInput.numericValue.toFixed(2).replace(".", ",")}</div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <strong>Instruções:</strong> Digite apenas números. O valor deve se mover para a esquerda conforme você digita.
            Por exemplo: "123" = R$ 1,23, "1234" = R$ 12,34, "12345" = R$ 123,45
          </div>
        </CardContent>
      </Card>

      {/* Teste das Formas de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Teste Formas de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Total de formas carregadas: {formasPagamento.length}</Label>
            
            <div className="bg-gray-100 p-3 rounded text-sm">
              <strong>Formas disponíveis:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {formasPagamento.map((forma) => (
                  <li key={forma.id}>
                    ID: {forma.id} - Nome: {forma.nome}
                    {forma.nome?.toLowerCase().includes("boleto") && (
                      <span className="text-green-600 font-bold"> ✅ BOLETO ENCONTRADO</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="forma-pagamento-teste">Selecionar Forma de Pagamento</Label>
            <Select
              value={selectedFormaPagamento}
              onValueChange={setSelectedFormaPagamento}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma" />
              </SelectTrigger>
              <SelectContent>
                {formasPagamento.map((forma) => (
                  <SelectItem key={forma.id} value={forma.id.toString()}>
                    {forma.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFormaPagamento && (
            <div className="bg-blue-100 p-3 rounded">
              <strong>Forma selecionada:</strong> {
                formasPagamento.find(f => f.id.toString() === selectedFormaPagamento)?.nome
              }
              <br />
              <strong>É boleto?</strong> {
                formasPagamento.find(f => f.id.toString() === selectedFormaPagamento)?.nome
                  ?.toLowerCase().includes("boleto") ? "SIM" : "NÃO"
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug localStorage */}
      <Card>
        <CardHeader>
          <CardTitle>Debug localStorage</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => {
              const formasLS = localStorage.getItem("formas_pagamento");
              console.log("Formas no localStorage:", formasLS);
              if (formasLS) {
                const parsed = JSON.parse(formasLS);
                console.log("Formas parseadas:", parsed);
                const temBoleto = parsed.some((f: any) => 
                  f.nome?.toLowerCase().includes("boleto")
                );
                console.log("Tem boleto no localStorage?", temBoleto);
              }
            }}
          >
            Debug localStorage
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
