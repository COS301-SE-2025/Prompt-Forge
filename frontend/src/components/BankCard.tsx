import { cn } from "@/lib/utils";
import { PayoutCard } from "@/Models/Payout"
import { Wifi } from 'lucide-react'



type BankCardProps = {
  payoutCard: PayoutCard,
  className?: string;
  color?: string;
}


export default function BankCard({ payoutCard, className = "", color="black" }: BankCardProps) {
  // let color = getCardColor(payoutCard.bank.name.toLowerCase())
  
  return (
    <div>
      {/* Card Front */}
      <div className={cn(
        `relative overflow-hidden w-90 h-56 max-w-sm min-w-[280px] aspect-[1.6/1] bg-gradient-to-br from-slate-900 via-`+color+`-900 to-slate-800 rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 text-white flex flex-col justify-between pb-8`,
        className
      )}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
        </div>
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-lg sm:text-base font-bold truncate">
              {payoutCard.bank.name}
            </span>
            {/* Chip */}
            <div className="w-8 h-6 sm:w-10 sm:h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md flex items-center justify-center">
              <div className="grid grid-cols-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-yellow-800 rounded-full"></div>
                ))}
              </div>
            </div>
          </div>
          {/* Contactless Payment Icon */}
          <Wifi className="w-4 h-4 sm:w-5 sm:h-5 rotate-90 opacity-60" />
        </div>

        {/* Middle Section - Account Number */}
        <div className="text-center">
          <div className="text-2xl sm:text-2xl font-mono tracking-wider break-all">
            {payoutCard.accountNumber}
          </div>
          <div className="text-xs text-gray-300 uppercase tracking-wide mt-1">
            Account Number
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-end gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-lg sm:text-base font-semibold uppercase tracking-wide truncate">
              {payoutCard.accountHolder}
            </div>
            <div className="text-xs text-gray-300 uppercase tracking-wide">
              Card Holder
            </div>
          </div>

          {/* Card Network Logo */}
          <div className="flex-shrink-0">
            <div className="w-8 h-5 sm:w-10 sm:h-6 bg-white rounded flex items-center justify-center">
              <div className="flex">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full opacity-80"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full -ml-1 sm:-ml-1.5 opacity-80"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
