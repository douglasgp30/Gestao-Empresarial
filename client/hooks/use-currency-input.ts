import { useState, useCallback } from "react";

/**
 * Hook para input de moeda no formato R$ 00,00
 * Os números se deslocam para a esquerda conforme o usuário digita
 */
export const useCurrencyInput = (initialValue: string = "") => {
  // Converter valor inicial para formato de exibição
  const formatInitialValue = (value: string) => {
    if (!value) return "R$ 0,00";
    const numericValue = parseFloat(value.replace(/[^\d]/g, "")) || 0;
    return formatCurrency(numericValue);
  };

  const [displayValue, setDisplayValue] = useState(
    formatInitialValue(initialValue),
  );
  const [numericValue, setNumericValue] = useState(0);

  const formatCurrency = (cents: number) => {
    const reais = Math.floor(cents / 100);
    const centavos = cents % 100;
    return `R$ ${reais.toLocaleString("pt-BR")},${centavos.toString().padStart(2, "0")}`;
  };

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value;

      // Extrair apenas dígitos
      const digits = input.replace(/\D/g, "");

      // Converter para número (em centavos)
      const numericCents = parseInt(digits) || 0;

      // Formatar para exibição
      const formatted = formatCurrency(numericCents);

      setDisplayValue(formatted);
      setNumericValue(numericCents / 100); // Valor em reais
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
    const cents = Math.round(value * 100);
    setNumericValue(value);
    setDisplayValue(formatCurrency(cents));
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
    },
  };
};
