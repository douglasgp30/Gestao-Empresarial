import React, { useEffect } from "react";

export function ForceOvalSwitches() {
  useEffect(() => {
    // Forçar switches ovais via JavaScript se CSS não funcionar
    const forceOvalStyles = () => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      const radixCheckboxes = document.querySelectorAll('[role="checkbox"]');
      
      // Aplicar estilos inline para garantir formato oval
      checkboxes.forEach((checkbox) => {
        const el = checkbox as HTMLElement;
        el.style.width = '28px';
        el.style.height = '8px';
        el.style.borderRadius = '8px';
        el.style.backgroundColor = el.matches(':checked') ? '#007bff' : '#ddd';
        el.style.border = 'none';
        el.style.appearance = 'none';
        el.style.position = 'relative';
        el.style.marginRight = '8px';
        el.style.cursor = 'pointer';
      });

      // Para Radix checkboxes
      radixCheckboxes.forEach((checkbox) => {
        const el = checkbox as HTMLElement;
        el.style.width = '28px';
        el.style.height = '8px';
        el.style.borderRadius = '8px';
        el.style.border = 'none';
      });
    };

    // Aplicar imediatamente
    forceOvalStyles();

    // Aplicar quando novos elementos forem adicionados
    const observer = new MutationObserver(() => {
      setTimeout(forceOvalStyles, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null; // Componente invisível
}

// Hook para usar em qualquer lugar
export function useOvalSwitches() {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      input[type="checkbox"] {
        width: 28px !important;
        height: 8px !important;
        border-radius: 8px !important;
        background-color: #ddd !important;
        border: none !important;
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        appearance: none !important;
        position: relative !important;
        margin-right: 8px !important;
        cursor: pointer !important;
      }
      
      input[type="checkbox"]:checked {
        background-color: #007bff !important;
      }
      
      input[type="checkbox"]::before {
        content: "" !important;
        position: absolute !important;
        top: 1px !important;
        left: 1px !important;
        width: 6px !important;
        height: 6px !important;
        border-radius: 50% !important;
        background-color: #666 !important;
        transition: all 0.2s ease !important;
      }
      
      input[type="checkbox"]:checked::before {
        left: 20px !important;
        background-color: white !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);
}
