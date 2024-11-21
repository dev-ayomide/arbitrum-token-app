import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(({ className, ...props }, ref) => (
  <SelectPrimitive.Root {...props}>
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      <SelectPrimitive.Value />
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="w-4 h-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    <SelectPrimitive.Content className="overflow-hidden bg-background rounded-md shadow-md">
      <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 bg-background">
        <ChevronUp className="w-4 h-4 opacity-50" />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport className="p-1">
        <SelectPrimitive.Item
          className={cn(
            "relative flex items-center px-8 py-2 rounded-md text-sm text-foreground focus:bg-accent focus:text-accent-foreground",
            "radix-disabled:opacity-50 radix-disabled:pointer-events-none"
          )}
        >
          <SelectPrimitive.ItemText />
          <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
            <Check className="w-4 h-4" />
          </SelectPrimitive.ItemIndicator>
        </SelectPrimitive.Item>
      </SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6 bg-background">
        <ChevronDown className="w-4 h-4 opacity-50" />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Root>
));
Select.displayName = "Select";

export { Select };