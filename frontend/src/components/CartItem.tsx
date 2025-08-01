import React, { Dispatch, SetStateAction } from 'react';
import { Trash2Icon, StarIcon } from 'lucide-react';
import { EnrichedPrompt } from '@/models/CartPrompt';
import { Category, CategoryColors } from '@/models/Prompt';
import { CartService } from '@/services/cartServices';
interface CartItemProps extends EnrichedPrompt {
  fetchData: () => Promise<void>;
  setRemoving: Dispatch<SetStateAction<boolean>>;
}
export const CartItem = ({
  promptId,
  promptTitle,
  promptTags,
  promptPrice,
  reviewCount,
  averageRating,
  authorName,

  fetchData,
  setRemoving
}: CartItemProps) => {

  const cartService = new CartService();

  const handleRemove = async () => {
    setRemoving(true);
    await cartService.removeFromCart(promptId);
    await fetchData(); // Refresh cart after removal
  };
  
  // Add proper null checks
  return <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 border-b border-gray-800">
    <div className="flex-1">
      <div className="flex items-center space-x-2 mb-2">
        {
          (promptTags || []).map((category: Category) => {
            return <span key={category} className={`
                px-3 py-1 text-sm rounded-md ${CategoryColors[category] ? CategoryColors[category] : CategoryColors["default"]}
                ${category === 'Writing' ? 'bg-blue-900 text-blue-200' : ''}
                ${category === 'Marketing' ? 'bg-purple-900 text-purple-200' : ''}
                ${category === 'Development' ? 'bg-green-900 text-green-200' : ''}
                ${category === 'Design' ? 'bg-pink-900 text-pink-200' : ''}
          `}>
              {category}
            </span>
          })
        }
        
        {reviewCount && averageRating ? (
          <div className="flex items-center text-yellow-400">
            <StarIcon size={16} fill="currentColor" />
            <span className="ml-1 text-sm">{averageRating?.toFixed(1) || '0.0'}</span>
          </div>
        ) : null}
      </div>
      
      <h3 className="text-lg font-medium mb-1">{promptTitle || 'Untitled Prompt'}</h3>
      <div className="flex items-center text-gray-400 text-sm">
        <span>by {authorName || 'Anonymous'}</span>
      </div>
    </div>
    
    <div className="flex items-center mt-4 md:mt-0">
      <span className="font-medium text-lg mr-6">
        {typeof promptPrice === 'number' 
          ? (promptPrice === 0 ? 'Free' : `$${promptPrice.toFixed(2)}`)
          : 'Free'}
      </span>
      <button onClick={handleRemove} className="text-gray-400 hover:text-red-500 transition-colors p-1">
        <Trash2Icon size={18} />
      </button>
    </div>
  </div>;
};


