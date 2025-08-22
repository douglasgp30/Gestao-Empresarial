import { useState, useCallback } from "react";

/**
 * Hook para input de moeda no formato R$ 00,00
 * Os números se deslocam para a esquerda conforme o usuário digita
 */
export const useCurrencyInput = (initialValue: string = "") => {
  // Converter valor inicial para formato de exibição
  const formatInitialValue = (value: string) => {
    if (!value) return "R$ 0,00";
    const numericValue = parseFloat(value) || 0;
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

      // Extrair apenas dígitos (mesmo padrão da Meta)
      const digits = input.replace(/\D/g, "");

      // Se vazio, mostrar R$ 0,00
      if (!digits) {
        setDisplayValue("R$ 0,00");
        setNumericValue(0);
        return;
      }

      // Converter para número em reais (dividindo por 100 para considerar centavos)
      const valueInReais = parseInt(digits) / 100;

      // Formatar usando o mesmo padrão da Meta
      const formatted = formatCurrency(valueInReais);

      setDisplayValue(formatted);
      setNumericValue(valueInReais);
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
    },
  };
};
