import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Forçando estilo para sobrescrever framework - tamanho menor e alinhado
      "peer !h-4 !w-4 shrink-0 !border-[1.5px] !border-[#333] !rounded-[3px] !bg-white !mr-1.5 hover:!border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:!bg-white data-[state=checked]:!border-[#333] dark:!border-gray-300 dark:!bg-gray-900 dark:hover:!border-gray-100 dark:data-[state=checked]:!bg-gray-900 dark:data-[state=checked]:!border-gray-300",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        "flex items-center justify-center !text-[#0f5132] dark:!text-green-400",
      )}
    >
      <span className="!text-sm !font-bold leading-none !-mt-0.5 !-ml-0.5">✔</span>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
