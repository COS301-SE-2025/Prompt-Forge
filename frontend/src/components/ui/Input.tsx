import type React from "react"
import { cn } from "../../lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  displayBorder?:Boolean
}

export function Input({id, className,displayBorder, ...props }: InputProps) {
  return (
    <input id={id}
      className={(displayBorder==null || displayBorder==true)?cn(
        "flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      ) : cn(
        "flex h-10 w-full rounded-md bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      ) }
      {...props}
    />
  )
}
