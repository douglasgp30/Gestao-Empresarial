import { toast as sonnerToast } from "sonner";

// Wrapper de compatibilidade para converter toasts antigos para Sonner
export function useToast() {
  const toast = (options: any) => {
    if (typeof options === "string") {
      sonnerToast(options);
      return;
    }

    if (options?.title && options?.description) {
      if (options.variant === "destructive") {
        sonnerToast.error(`${options.title}: ${options.description}`);
      } else {
        sonnerToast.success(`${options.title}: ${options.description}`);
      }
    } else if (options?.title) {
      if (options.variant === "destructive") {
        sonnerToast.error(options.title);
      } else {
        sonnerToast.success(options.title);
      }
    } else if (options?.description) {
      if (options.variant === "destructive") {
        sonnerToast.error(options.description);
      } else {
        sonnerToast.success(options.description);
      }
    }
  };

  return { toast };
}

// Também exportar diretamente para compatibilidade
export const toast = (options: any) => {
  if (typeof options === "string") {
    sonnerToast(options);
    return;
  }

  if (options?.title && options?.description) {
    if (options.variant === "destructive") {
      sonnerToast.error(`${options.title}: ${options.description}`);
    } else {
      sonnerToast.success(`${options.title}: ${options.description}`);
    }
  } else if (options?.title) {
    if (options.variant === "destructive") {
      sonnerToast.error(options.title);
    } else {
      sonnerToast.success(options.title);
    }
  } else if (options?.description) {
    if (options.variant === "destructive") {
      sonnerToast.error(options.description);
    } else {
      sonnerToast.success(options.description);
    }
  }
};
