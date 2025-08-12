import { useEffect } from 'react';

/**
 * Hook para fazer o Enter funcionar como Tab em formulários
 * @param formRef - Referência do formulário
 * @param isEnabled - Se o comportamento está habilitado (padrão: true)
 */
export const useEnterAsTab = (formRef: React.RefObject<HTMLFormElement>, isEnabled: boolean = true) => {
  useEffect(() => {
    if (!isEnabled || !formRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
        const form = formRef.current;
        if (!form) return;

        const formElements = Array.from(form.elements) as HTMLElement[];
        const focusableElements = formElements.filter(
          (element) =>
            element.tabIndex !== -1 &&
            !element.hasAttribute('disabled') &&
            !element.hasAttribute('readonly') &&
            (element as any).type !== 'submit' &&
            (element as any).type !== 'button' &&
            element.offsetParent !== null // Verifica se o elemento está visível
        );

        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
        
        if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
          event.preventDefault();
          focusableElements[currentIndex + 1].focus();
        }
      }
    };

    const form = formRef.current;
    form.addEventListener('keydown', handleKeyDown);

    return () => {
      form.removeEventListener('keydown', handleKeyDown);
    };
  }, [formRef, isEnabled]);
};
