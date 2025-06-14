import React from 'react';
import { Trash2Icon, StarIcon } from 'lucide-react';
interface CartItemProps {
  id: string;
  title: string;
  category: string;
  price: number;
  rating: number;
  author: string;
  authorHandle: string;
  removeItem: (id: string) => void;
}
export const CartItem = ({
  id,
  title,
  category,
  price,
  rating,
  author,
  authorHandle,
  removeItem
}: CartItemProps) => {
  return <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 border-b border-gray-800">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <span className={`
                        px-3 py-1 text-sm rounded-md
                        ${category === 'Writing' ? 'bg-blue-900 text-blue-200' : ''}
                        ${category === 'Marketing' ? 'bg-purple-900 text-purple-200' : ''}
                        ${category === 'Development' ? 'bg-green-900 text-green-200' : ''}
                        ${category === 'Design' ? 'bg-pink-900 text-pink-200' : ''}
                    `}>
            {category}
          </span>
          <div className="flex items-center text-yellow-400">
            <StarIcon size={16} fill="currentColor" />
            <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
          </div>
        </div>
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        <div className="flex items-center text-gray-400 text-sm">
          <span>by {author}</span>
          <span className="mx-1">·</span>
          <span>{authorHandle}</span>
        </div>
      </div>
      <div className="flex items-center mt-4 md:mt-0">
        <span className="font-medium text-lg mr-6">${price.toFixed(2)}</span>
        <button onClick={() => removeItem(id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
          <Trash2Icon size={18} />
        </button>
      </div>
    </div>;
};