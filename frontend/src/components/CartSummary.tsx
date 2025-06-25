import { EnrichedPrompt } from "@/Models/CartPrompt"
import { CartService } from "@/services/cartServices"
import { Dispatch, SetStateAction } from "react"
import { Link } from "react-router-dom"

interface CartSummaryProps {
  subtotal: number
  discount?: number,
  prompts:EnrichedPrompt[],
  setCartItems:Dispatch<SetStateAction<EnrichedPrompt[]>>
}
export const CartSummary = ({
  subtotal,
  discount = 0,prompts,setCartItems
}: CartSummaryProps) => {
  const cartService = new CartService()
  const total = subtotal - discount
  const checkout = () =>{
    cartService.checkout(prompts)
    .then(res=>{
      alert(res.message);
      setCartItems([]);
    })
    .catch(err=>{
      alert(err.message);
    })
  }
  return <div>
      <h3 className="text-lg font-medium mb-4">Order Summary</h3>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-400">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && <div className="flex justify-between">
            <span className="text-gray-400">Discount</span>
            <span className="text-green-500">-${discount.toFixed(2)}</span>
          </div>}
        <div className="border-t border-gray-800 pt-3 flex justify-between font-medium">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    <button onClick={checkout} className="w-full bg-[#3ebb9e] hover:bg-[#00674f] text-white py-3 rounded-md font-medium transition-colors">
      Checkout
    </button>
    <button className="w-full text-center mt-4 text-[#3ebb9e] hover:text-[#00674f]">
      <Link to='/marketplace'>Continue Shopping</Link>
        
      </button>
    </div>
}