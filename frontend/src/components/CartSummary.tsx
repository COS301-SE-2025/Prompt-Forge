import { EnrichedPrompt } from "@/Models/CartPrompt"
import { CartService, PaymentAccessCodeAndReference } from "@/services/cartServices"
import { Button } from "./ui/Button"
import PaystackPop from '@paystack/inline-js'
import { useState } from "react"
import { Loader2 } from "lucide-react"

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

  // Notification helper (styled like EditorPage model alerts)
  const showNotification = (type: "success" | "error", title: string, message: string) => {
    const color = type === "success" ? "green" : "red"
    const bg = type === "success" ? "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200"
                                  : "bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200"
    const icon = type === "success"
      ? `<svg class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`
      : `<svg class="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>`
    const notification = document.createElement('div')
    notification.className = `fixed bottom-4 right-4 ${bg} border p-4 rounded-lg shadow-lg z-50 max-w-md animate-fade-in`
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0 mt-0.5">${icon}</div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium">${title}</h3>
          <div class="mt-1 text-xs">${message}</div>
        </div>
      </div>
    `
    document.body.appendChild(notification)
    setTimeout(() => {
      notification.classList.add('animate-fade-out')
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 500)
    }, 4000)
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    try {
      if (total == 0) {
        cartService.checkout(prompts)
        .then(()=>{
          onCheckoutSuccess()
          showNotification("success", "Checkout successful!", "Items purchased.")
        })
        .catch((error:string)=>{
          showNotification("error", "Checkout failed", error || "Unknown error")
        })
      }
      else {
        cartService.initializePayment(prompts, parseFloat(total.toFixed(2)))
        .then((result: PaymentAccessCodeAndReference )=>{
          var handler = PaystackPop.setup({
            key: 'pk_test_b8d73ecfdb50d9ef78e703219f665f9cd9255aa9',
            email: result.customerEmail,
            amount: result.amount,
            reference: result.reference,
            callback: function (response:{status:string}) {
              if(response.status == "success"){
                cartService.checkout(prompts)
                .then(() => {
                  onCheckoutSuccess()
                  showNotification("success", "Checkout successful!", "Items purchased.")
                })
                .catch((error: string) => {
                  showNotification("error", "Checkout failed", error || "Unknown error")
                })
              }
            },
            onClose: function () {}
          } as any);

          (handler as any).openIframe();
        })
        .catch((error)=>{
          showNotification("error", "Checkout failed", error.message || "Unknown error")
        })
      }
    } catch (error: any) {
      showNotification("error", "Checkout failed", error.message || "Unknown error")
      console.error("Checkout failed:", error)
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
        className="w-full bg-[#3ebb9e] hover:bg-[#00674f] text-white"
        onClick={handleCheckout}
        disabled={isCheckingOut || prompts.length === 0}
      >
        {isCheckingOut ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="loading-spinner" />
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