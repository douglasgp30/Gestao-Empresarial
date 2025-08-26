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
      // Checkbox transformado em switch moderno - igual ao Switch
      "peer relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border-0 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#007bff] data-[state=unchecked]:bg-[#ddd] mr-2",
      className,
    )}
    {...props}
  >
    {/* Bolinha que sempre existe e se move */}
    <div className="absolute h-3 w-3 rounded-full transition-all duration-200 data-[state=checked]:translate-x-3.5 data-[state=unchecked]:translate-x-0.5 data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-600"
         data-state={props.checked ? 'checked' : 'unchecked'} />

    {/* Indicator invisível mas necessário para funcionalidade */}
    <CheckboxPrimitive.Indicator className="opacity-0">
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
