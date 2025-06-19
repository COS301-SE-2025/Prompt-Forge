import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/Button';
interface PurchaseButtonProps {
  price: number;
  onClick: () => void;
}
export const PurchaseButton = ({
  onClick
}: PurchaseButtonProps) => {
  return <Button onClick={onClick} className="flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white transition-colors duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
      <ShoppingCart className="w-5 h-5 mr-2" />
      Add to cart  
    </Button>;
};