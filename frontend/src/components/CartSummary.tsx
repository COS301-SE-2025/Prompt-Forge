import { EnrichedPrompt } from "@/Models/CartPrompt"
import { CartService } from "@/services/cartServices"
import { Dispatch, SetStateAction, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "./ui/Button"

interface CartSummaryProps {
  subtotal: number
  prompts: EnrichedPrompt[]
  setCartItems: Dispatch<SetStateAction<EnrichedPrompt[]>>
  onCheckoutSuccess?: () => void
}

export const CartSummary = ({
  subtotal,
  prompts,
  setCartItems,
  onCheckoutSuccess
}: CartSummaryProps) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const cartService = new CartService()

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    try {
      const response = await cartService.checkout(prompts)

      // Debug: log the response to see its structure
      console.log("Checkout response:", response)

      // Check if the response indicates success
      // Since the response only has a message property, check if it contains success keywords
      if (
        response.message &&
        (response.message.includes("successfully") ||
          response.message.includes("Prompts purchased successfully"))
      ) {
        setCartItems([]) // Clear cart immediately
        onCheckoutSuccess?.() // Call success callback
        alert("Checkout successful! Items purchased.")
      } else {
        alert("Checkout failed: " + (response.message || "Unknown error"))
      }
    } catch (error: any) {
      console.error("Checkout failed:", error)
      alert("Checkout failed: " + (error.message || "Unknown error"))
    } finally {
      setIsCheckingOut(false)
    }
  }

  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

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