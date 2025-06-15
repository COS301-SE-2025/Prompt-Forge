import { useState } from 'react';
import { CartSummary } from '@/components/CartSummary';
import { ShoppingCartIcon } from 'lucide-react';
import { CartItem } from '@/components/CartItem';
import { Link } from 'react-router-dom';

const initialCartItems = [{
    id: '1',
    title: 'Expert Content Writer',
    category: 'Writing',
    price: 4.99,
    rating: 4.8,
    author: 'Content Pro',
    authorHandle: '@writer_pro'
}, {
    id: '2',
    title: 'Advanced SEO Optimizer',
    category: 'Marketing',
    price: 6.99,
    rating: 4.9,
    author: 'SEO Master',
    authorHandle: '@seomaster'
}, {
    id: '3',
    title: 'UI/UX Design Assistant',
    category: 'Design',
    price: 7.99,
    rating: 4.6,
    author: 'Design Pro',
    authorHandle: '@designpro'
}];

export default function CartPage(){
    const [cartItems, setCartItems] = useState(initialCartItems);
    const removeItem = (id: string) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };
    const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
    return <div className="w-full pt-10 px-16 mx-auto" >
      <div className="flex items-center mb-8">
        <ShoppingCartIcon className="mr-3" size={24} />
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <span className="ml-3 text-gray-400">({cartItems.length} items)</span>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={cartItems.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
                {cartItems.length > 0 ?
                    <div>
                        {cartItems.map(item => <CartItem key={item.id} {...item} removeItem={removeItem} />)}
                    </div>
                    :
                    <div className="text-center py-12">
                        <ShoppingCartIcon className="mx-auto mb-4 text-gray-500" size={48} />
                        <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
                        <p className="text-gray-400 mb-6">
                            Browse the marketplace to find prompts you'll love
                        </p>
                        <Link to="/marketplace" className="bg-[#00674f] hover:bg-[#3ebb9e] text-white px-6 py-2 rounded-md font-medium transition-colors">
                            Explore Marketplace
                        </Link>
                    </div>
                }
            </div>
        <div>{cartItems.length > 0 && <CartSummary subtotal={subtotal} />}</div>
        </div>
    </div>
}