import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex !h-4 !w-7 shrink-0 cursor-pointer items-center !border-[1.5px] !border-[#333] !rounded-[3px] !bg-white !mr-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:!bg-[#333] data-[state=checked]:!border-[#333] data-[state=unchecked]:!bg-white hover:!border-black dark:!border-gray-300 dark:!bg-gray-900 dark:hover:!border-gray-100 dark:data-[state=checked]:!bg-gray-300 dark:data-[state=checked]:!border-gray-300 dark:data-[state=unchecked]:!bg-gray-900",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block !h-2.5 !w-2.5 !rounded-[1px] !bg-[#333] transition-transform data-[state=checked]:!translate-x-2.5 data-[state=unchecked]:!translate-x-0 data-[state=checked]:!bg-white dark:!bg-gray-300 dark:data-[state=checked]:!bg-gray-900",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
