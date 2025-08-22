import { useState, useCallback } from "react";

/**
 * Hook para input de moeda no formato R$ 00,00
 * Os números se deslocam para a esquerda conforme o usuário digita
 */
export const useCurrencyInput = (initialValue: string = "") => {
  // Converter valor inicial para formato de exibição
  const formatInitialValue = (value: string) => {
    if (!value) return "R$ 0,00";

    // Extrair apenas dígitos para lidar com strings formatadas
    const digits = value.replace(/\D/g, "");
    const numericValue = digits ? parseInt(digits) / 100 : 0;
    return formatCurrency(numericValue);
  };

  const [displayValue, setDisplayValue] = useState(
    formatInitialValue(initialValue),
  );
  const [numericValue, setNumericValue] = useState(0);

  const formatCurrency = (valueInReais: number) => {
    // Usar o mesmo padrão da Meta - Intl.NumberFormat
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valueInReais);
  };

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value;

      // Remover tudo que não é dígito (exatamente igual ao Dashboard)
      const numericValue = input.replace(/\D/g, "");

      // Se vazio, retornar formato inicial
      if (!numericValue) {
        setDisplayValue("R$ 0,00");
        setNumericValue(0);
        return;
      }

      // Converter para número (dividindo por 100 para considerar centavos)
      const number = parseInt(numericValue) / 100;

      // Formatar como moeda brasileira (idêntico ao Dashboard)
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(number);

      setDisplayValue(formatted);
      setNumericValue(number);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Enter",
        "Escape",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];

      // Permitir apenas números e teclas de controle
      if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key)) {
        event.preventDefault();
      }
    },
    [],
  );

  // Função para obter o valor numérico
  const getValue = useCallback(() => numericValue, [numericValue]);

  // Função para definir um valor programaticamente
  const setValue = useCallback((value: number) => {
    setNumericValue(value);
    setDisplayValue(formatCurrency(value));
  }, []);

  // Função para resetar
  const reset = useCallback(() => {
    setDisplayValue("R$ 0,00");
    setNumericValue(0);
  }, []);

  return {
    displayValue,
    numericValue,
    handleInputChange,
    handleKeyDown,
    getValue,
    setValue,
    reset,
    // Props para serem passadas diretamente para o Input
    inputProps: {
      value: displayValue,
      onChange: handleInputChange,
      onKeyDown: handleKeyDown,
      placeholder: "R$ 0,00",
      inputMode: "numeric" as const,
      pattern: "[0-9]*",
      onFocus: (e: React.FocusEvent<HTMLInputElement>) =>
        e.currentTarget.select(),
    },
  };
};
