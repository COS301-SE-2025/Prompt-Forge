import type React from "react"
import { ChevronUp, ChevronDown, Minus } from "lucide-react"
// import { cn } from "../lib/utils"
import {  ReactNode } from "react"


interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
    heading:string,
    headingIcon: ReactNode,
    value: number,
    icon:ReactNode,
    changeValue:string
}
export function DashboardCard({ heading, headingIcon, value, icon, changeValue}: DashboardCardProps) {
  return (

    <>
          <div className="flex justify-center items-center">
              <p className="text-sm text-muted-foreground font-medium h-fit pl-5 font-semibold">{heading}</p>
              <div className="p-2 w-fit">
                  {headingIcon}
              </div>
          </div>
          <div className="text-center mb-5">
              <h3 className="text-2xl font-bold justify-center">{value}</h3>
          </div>

          <div className="flex items-center text-xs justify-center">
              {icon}
              <span className="text-red-500 font-medium pr-2">{changeValue} last month</span>
          </div>
    </>
  )
}
