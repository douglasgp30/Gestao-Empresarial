import { useEffect } from "react";

/**
 * Hook para fazer o Enter funcionar como Tab em formulários
 * @param formRef - Referência do formulário
 * @param isEnabled - Se o comportamento está habilitado (padrão: true)
 */
export const useEnterAsTab = (
  formRef: React.RefObject<HTMLFormElement>,
  isEnabled: boolean = true,
) => {
  useEffect(() => {
    if (!isEnabled || !formRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Evitar processamento se não for Enter ou se estiver em um textarea
      if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement;

      // Não aplicar Enter-as-Tab em textareas ou elementos que requerem quebra de linha
      if (target.tagName === "TEXTAREA" || target.contentEditable === "true") {
        return;
      }

      const form = formRef.current;
      if (!form) return;

      // Usar uma seleção mais específica e eficiente de elementos focalizáveis
      const focusableSelector = 'input:not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const focusableElements = Array.from(form.querySelectorAll(focusableSelector))
        .filter((element: Element) => {
          const htmlElement = element as HTMLElement;
          return htmlElement.offsetParent !== null && // Verifica se está visível
                 htmlElement.tabIndex !== -1 &&
                 !htmlElement.hidden &&
                 (htmlElement as any).type !== "submit";
        }) as HTMLElement[];

      const currentIndex = focusableElements.indexOf(target);

      if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
        event.preventDefault();
        event.stopPropagation();

        // Usar requestAnimationFrame para melhor performance
        requestAnimationFrame(() => {
          focusableElements[currentIndex + 1].focus();
        });
      }
    };

    const form = formRef.current;
    form.addEventListener("keydown", handleKeyDown, { passive: false });

    return () => {
      form.removeEventListener("keydown", handleKeyDown);
    };
  }, [formRef, isEnabled]);
};
