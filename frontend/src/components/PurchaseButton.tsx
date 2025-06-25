import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/Button';

interface PurchaseButtonProps {
  price: number
  onClick: () => Promise<void> | void
  disabled?: boolean
  loading?: boolean
}

export const PurchaseButton = ({ 
  price, 
  onClick, 
  disabled = false,
  loading = false 
}: PurchaseButtonProps) => {
  const getButtonClasses = () => {
    let classes = "purchase-button"
    
    if (price === 0) {
      classes += " free"
    }
    
    if (loading) {
      classes += " loading"
    }
    
    return classes
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={getButtonClasses()}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Processing...
        </div>
      ) : (
        <>
          {price === 0 ? "Get Free" : `Add to cart for $${price.toFixed(2)}`}
        </>
      )}
    </Button>
  )
}