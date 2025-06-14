interface CartSummaryProps {
  subtotal: number
  discount?: number
}
export const CartSummary = ({
  subtotal,
  discount = 0
}: CartSummaryProps) => {
  const total = subtotal - discount
  return <div className="bg-[#1a1a1a] rounded-lg p-6">
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
    <button className="w-full bg-[#3ebb9e] hover:bg-[#00674f] text-white py-3 rounded-md font-medium transition-colors">
        Proceed to Checkout
      </button>
      <button className="w-full text-center mt-4 text-green-500 hover:text-green-400">
        Continue Shopping
      </button>
    </div>
}