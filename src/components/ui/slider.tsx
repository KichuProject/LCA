import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  color?: "primary" | "success" | "warning" | "destructive";
  orientation?: "horizontal" | "vertical";
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, color = "primary", orientation = "horizontal", ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex touch-none select-none items-center",
      orientation === "horizontal" ? "h-full w-full" : "h-full w-fit flex-col",
      className
    )}
    orientation={orientation}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        "relative grow overflow-hidden rounded-full bg-secondary",
        orientation === "horizontal" ? "h-2 w-full" : "h-full w-2"
      )}
    >
      <SliderPrimitive.Range
        className={cn("absolute", 
          orientation === "horizontal" ? "h-full" : "w-full",
          {
            "bg-primary": color === "primary",
            "bg-success": color === "success",
            "bg-warning": color === "warning",
            "bg-destructive": color === "destructive",
          }
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "block h-5 w-5 rounded-full border-2 bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        {
          "border-primary": color === "primary",
          "border-success": color === "success",
          "border-warning": color === "warning",
          "border-destructive": color === "destructive",
        },
        "shadow-lg" // Added effect
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };