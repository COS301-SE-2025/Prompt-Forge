import { PayoutCard } from "@/Models/Payout"
import { Wifi } from "lucide-react"

const cardColor = {
  "absa": "red",
  "african bank": "green",
  "bidvest": "red",
  "capitec": "red",
  "discovery": "purple",
  "fnb": "green",
  "nedbank": "green",
  "standard bank": "blue",
  "tymebank": "yellow",
} as const;

type BankKey = keyof typeof cardColor;

function getCardColorStartsWith(input: string): string {
  const normalizedInput = input.trim().toLowerCase();
  
  for (const bank of Object.keys(cardColor)) {        
    if (normalizedInput.startsWith(bank)) {      
      return cardColor[bank as BankKey];
    }
  }

  return "black";  // default if no match
}

export default function BankCard({bank,accountHolder,accountNumber}:PayoutCard) {
  return (
    <div className="relative">
      {/* Card Front */}
      <div className={`w-96 h-60 bg-gradient-to-br from-slate-900 via-${getCardColorStartsWith(bank.name.toLowerCase())}-900 to-slate-800 rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
        </div>

        {/* Contactless Payment Icon */}
        <div className="absolute top-6 right-6">
          <Wifi className="w-6 h-6 rotate-90 opacity-60" />
        </div>

        {/* Bank Logo */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-lg font-bold">{bank.name}</span>
        </div>

        {/* Chip */}
        <div className="absolute top-20 left-6">
          <div className="w-12 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md flex items-center justify-center">
            <div className="grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-yellow-800 rounded-full"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Card Number */}
        <div className="mt-11 mb-8 flex justify-center">
          <div>
            <div className="text-2xl font-mono tracking-wider">{accountNumber}</div>
            <div className="text-xs text-gray-300 uppercase tracking-wide mb-1">Account Number</div>
          </div>
        </div>

        {/* Card Details */}
        <div className="flex justify-between items-end">
          <div>
            <div className="text-lg font-semibold uppercase tracking-wide">{accountHolder}</div>
            <div className="text-xs text-gray-300 uppercase tracking-wide mb-1">Card Holder</div>
          </div>

          {/* Card Network Logo */}
          <div className="flex items-center mb-3">
            <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
              <div className="flex">
                <div className="w-4 h-4 bg-red-500 rounded-full opacity-80"></div>
                <div className="w-4 h-4 bg-yellow-500 rounded-full -ml-2 opacity-80"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
