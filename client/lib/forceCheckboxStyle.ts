/**
 * Utilitário para forçar estilos de checkbox via JavaScript
 * Use como último recurso se CSS !important não funcionar
 */

export const forceCheckboxStyle = () => {
  const style = `
    input[type="checkbox"] {
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
      width: 16px !important;
      height: 16px !important;
      border: 1.5px solid #333 !important;
      border-radius: 3px !important;
      background-color: #fff !important;
      margin-right: 6px !important;
      vertical-align: middle !important;
      position: relative !important;
      cursor: pointer !important;
    }
    
    input[type="checkbox"]:checked::after {
      content: "✔" !important;
      position: absolute !important;
      top: -3px !important;
      left: 1px !important;
      font-size: 14px !important;
      color: #0f5132 !important;
      font-weight: bold !important;
    }
    
    input[type="checkbox"]:hover {
      border-color: #000 !important;
    }
  `;

  // Remove style existente se houver
  const existingStyle = document.getElementById('force-checkbox-style');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Cria novo style element
  const styleElement = document.createElement('style');
  styleElement.id = 'force-checkbox-style';
  styleElement.textContent = style;
  
  // Adiciona no head como última coisa (maior prioridade)
  document.head.appendChild(styleElement);
  
  console.log('✅ Estilos de checkbox forçados via JavaScript');
};

/**
 * Aplica estilos inline diretamente no elemento
 */
export const forceCheckboxInlineStyle = (element: HTMLInputElement) => {
  if (element.type === 'checkbox') {
    element.style.cssText = `
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
      width: 16px !important;
      height: 16px !important;
      border: 1.5px solid #333 !important;
      border-radius: 3px !important;
      background-color: #fff !important;
      margin-right: 6px !important;
      vertical-align: middle !important;
      position: relative !important;
      cursor: pointer !important;
    `;
  }
};

/**
 * Observer para aplicar estilos em checkboxes criados dinamicamente
 */
export const startCheckboxStyleObserver = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Aplica em input[type="checkbox"] diretos
          if (element.tagName === 'INPUT' && (element as HTMLInputElement).type === 'checkbox') {
            forceCheckboxInlineStyle(element as HTMLInputElement);
          }
          
          // Aplica em input[type="checkbox"] filhos
          const checkboxes = element.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach((checkbox) => {
            forceCheckboxInlineStyle(checkbox as HTMLInputElement);
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log('👀 Observer de checkbox iniciado');
  return observer;
};

// Auto-execução se estiver no browser
if (typeof window !== 'undefined') {
  // Aplica estilos quando DOM carrega
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceCheckboxStyle);
  } else {
    forceCheckboxStyle();
  }
}
