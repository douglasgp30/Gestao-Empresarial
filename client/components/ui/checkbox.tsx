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
      // Seguindo exatamente o padrão CSS refinado fornecido pelo usuário
      "peer h-[18px] w-[18px] shrink-0 border-2 border-[#333] rounded-[3px] bg-white mr-2 hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-white data-[state=checked]:border-[#333] dark:border-gray-300 dark:bg-gray-900 dark:hover:border-gray-100 dark:data-[state=checked]:bg-gray-900 dark:data-[state=checked]:border-gray-300",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        "flex items-center justify-center text-black dark:text-gray-100",
      )}
    >
      <span className="text-base font-normal leading-none">✔</span>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
