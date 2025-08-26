import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Checkbox transformado em switch moderno
      "peer inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border-0 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#007bff] data-[state=unchecked]:bg-[#ddd] mr-2",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        "flex items-center justify-center pointer-events-none block h-3 w-3 rounded-full transition-transform duration-200 data-[state=checked]:translate-x-3.5 translate-x-0.5 bg-white data-[state=unchecked]:bg-gray-600",
      )}
    >
      {/* Bolinha do switch - sem ícone de check */}
    </CheckboxPrimitive.Indicator>
    {/* Bolinha para estado unchecked */}
    <div 
      className={cn(
        "absolute h-3 w-3 rounded-full transition-transform duration-200 bg-gray-600 translate-x-0.5",
        "peer-data-[state=checked]:opacity-0 peer-data-[state=unchecked]:opacity-100"
      )}
    />
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
