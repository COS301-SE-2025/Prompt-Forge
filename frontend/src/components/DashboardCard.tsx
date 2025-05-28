import { ChevronDown, ChevronUp, IconNode, Minus } from "lucide-react"
import type React from "react"
import {  ReactNode } from "react"


interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
    heading:string,
    headingIcon: ReactNode,
    value: number,
    changeValue:number,
    change:"loss"|"gain"|"none"
}
export function DashboardCard({ heading, headingIcon, value, changeValue, change}: DashboardCardProps) {
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
              {
                change == "gain" ?
                    <>
                        <ChevronUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium pr-2">+{changeValue}% last month</span>
                    </>  
                : change == "loss" ? 
                    <>
                        <ChevronDown className="h-3 w-3 text-red-500 mr-1" />
                        <span className="text-red-500 font-medium pr-2">-{changeValue}% last month</span>
                    </>  
        
                :
                    <>
                        <Minus className="h-3 w-3 text-gray-500 mr-1" />
                        <span className="text-gray-500 font-medium pr-2">{changeValue}% last month</span>
                    </>  
                
              }
              
          </div>
    </>
  )
}
