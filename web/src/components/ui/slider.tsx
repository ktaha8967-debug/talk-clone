"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  value?: number[]
  onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const currentValue = value?.[0] ?? 0

    return (
      <div className="flex items-center gap-3">
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={(e) => onValueChange?.([Number(e.target.value)])}
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-purple-500",
            className
          )}
          {...props}
        />
        <span className="min-w-[3rem] text-right text-sm text-gray-400">{currentValue}</span>
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
