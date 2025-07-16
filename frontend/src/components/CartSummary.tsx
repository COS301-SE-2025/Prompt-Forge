import { EnrichedPrompt } from "@/models/CartPrompt"
import { CartService, PaymentAccessCodeAndReference } from "@/services/cartServices"
import { useState } from "react"
import { Button } from "./ui/Button"
import PaystackPop from '@paystack/inline-js'

interface CartSummaryProps {
  subtotal: number
  prompts: EnrichedPrompt[]
  onCheckoutSuccess: () => void
}

export const CartSummary = ({
  subtotal,
  prompts,
  onCheckoutSuccess
}: CartSummaryProps) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const cartService = new CartService()
  const tax = subtotal * 0.18 // 10% tax
  const total = subtotal + tax
  const handleCheckout = async () => {
    setIsCheckingOut(true)
    try {
      if (total == 0) {
        cartService.checkout(prompts)
        .then(()=>{
          onCheckoutSuccess() // Call success callback
          alert("Checkout successful! Items purchased.")
        })
        .catch((error:string)=>{
          alert("Checkout failed: " + (error || "Unknown error"))
        })
      }
      else {
        cartService.initializePayment(prompts, parseFloat(total.toFixed(2)))
        .then((result: PaymentAccessCodeAndReference )=>{

          var handler = PaystackPop.setup({
            key: 'pk_test_b8d73ecfdb50d9ef78e703219f665f9cd9255aa9',
            email: result.customerEmail,
            amount: result.amount, // This amount must match what was initialized in the backend
            reference: result.reference,  // Use the reference from backend initialization
            callback: function (response:{status:string}) {
              if(response.status == "success"){
                cartService.checkout(prompts)
                .then(() => {
                  onCheckoutSuccess() // Call success callback
                  alert("Checkout successful! Items purchased.")
                })
                .catch((error: string) => {
                  alert("Checkout failed: " + (error || "Unknown error"))
                })
              }
              // Verify on backend
            },
            onClose: function () {
            }
          });

          handler.openIframe();
          
        })
      }
    } catch (error: any) {
      console.error("Checkout failed:", error)
      alert("Checkout failed: " + (error.message || "Unknown error"))
    } finally {
      setIsCheckingOut(false)
    }
  }


  return (
    <div className="bg-card border rounded-lg p-6 sticky top-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleCheckout}
        disabled={isCheckingOut || prompts.length === 0}
        className="w-full bg-[#3ebb9e] hover:bg-[#00674f] text-white"
      >
        {isCheckingOut ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          `Checkout (${prompts.length} item${
            prompts.length !== 1 ? "s" : ""
          })`
        )}
      </Button>
    </div>
  )
}