import type React from "react"
import { ChevronUp, ChevronDown, Minus } from "lucide-react"
import { cn } from "../lib/utils"
import { ReactHTMLElement, ReactNode } from "react"


interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
    heading:string,
    value: number,
    icon:ReactNode,
    change:"gain"|"loss"|"none",
    changeValue:number
}
export function DashboardCard({ heading, value, icon, change, changeValue}: DashboardCardProps) {
  return (

    <>
        <div className="flex justify-between items-start mb-2">
            <div>
                <p className="text-sm text-muted-foreground">{heading}</p>
                <h3 className="text-2xl font-bold">{value}</h3>
            </div>
            <div className="bg-[#3ebb9e]/10 p-2 rounded-md">
                {icon}
            </div>
        </div>
        <div className="flex items-center text-xs">
            {
                change=="gain"?
                    <>
                        <ChevronUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">+{changeValue}% last month</span>
                    </>
                : change == "loss" ? 
                    <>
                        <ChevronDown className="h-3 w-3 text-red-500 mr-1" />
                        <span className="text-red-500 font-medium">-{changeValue}% last month</span>
                    </>
                :
                    <>
                        <Minus className="h-3 w-3 text-grey-500 mr-1" />
                        <span className="text-grey-500 font-medium">0% last month</span>
                    </>
            }
        </div>
    </>
    // <textarea
    //   className={cn(
    //     "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    //     className,
    //   )}
    //   {...props}
    // />
  )
}
