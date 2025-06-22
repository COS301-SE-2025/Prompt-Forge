import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/Button';
interface PurchaseButtonProps {
  price: number;
  onClick: () => void;
}
export const PurchaseButton = ({
  price,
  onClick
}: PurchaseButtonProps) => {
  return <Button 
      onClick={onClick}
      className="w-full bg-[#3ebb9e] hover:bg-[#00674f] text-white"
    >
      Purchase for ${price.toFixed(2)}
    </Button>;
};