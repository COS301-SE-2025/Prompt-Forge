import { useEffect, useState } from 'react';
import { CartSummary } from '@/components/CartSummary';
import { ShoppingCartIcon } from 'lucide-react';
import { CartItem } from '@/components/CartItem';
import { Link } from 'react-router-dom';
import { CartService } from '@/services/cartServices';
import { CartPrompt, EnrichedPrompt } from '@/models/CartPrompt';
import { PromptService } from '@/services/promptService';

export default function CartPage() {
    const cartService = new CartService();
    const promptService = new PromptService()

    const [cartItems, setCartItems] = useState<EnrichedPrompt[]>([]);
    const [loading, setLoading] = useState(false)
    const [removing, setRemoving] = useState(false)

    const subtotal = cartItems.reduce((sum, item) => sum + item.promptPrice, 0);

    const enrichPromptsWithRatings = async (prompts: CartPrompt[]): Promise<EnrichedPrompt[]> => {
        const enrichedPrompts = await Promise.all(
            prompts.map(async (prompt) => {
                try {
                    const { averageRating, reviewCount } = await promptService.getPromptRatingSummary(prompt.promptId);
                    return {
                        ...prompt,
                        averageRating: averageRating || 0,
                        reviewCount: reviewCount || 0
                    };
                } catch (error) {
                    console.error(`Error fetching ratings for prompt ${prompt.promptId}:`, error);
                    return {
                        ...prompt,
                        averageRating: 0,
                        reviewCount: 0
                    };
                }
            })
        );

        return enrichedPrompts;
    };

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await cartService.getCart();
            const enrichedPrompts = await enrichPromptsWithRatings(res.content || []);
            setCartItems(enrichedPrompts);
        } catch (error) {
            console.error('Error fetching cart data:', error);
        } finally {
            setLoading(false);
            setRemoving(false);
        }
    }

    // Add this function to handle successful checkout
    const handleCheckoutSuccess = () => {
        setCartItems([]); // Clear cart items immediately
        // Optionally show success message or redirect
    };

    if (loading && (cartItems.length === 0 || removing)) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading Cart...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full pt-10 px-16 mx-auto">
            <div className="flex items-center mb-8">
                <ShoppingCartIcon className="mr-3" size={24} />
                <h1 className="text-2xl font-bold">Your Cart</h1>
                <span className="ml-3 text-gray-400">({cartItems.length} items)</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={cartItems.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
                    {cartItems.length > 0 ? (
                        <div>
                            {cartItems.map((item: EnrichedPrompt) => (
                                <CartItem 
                                    key={item.cartItemId} 
                                    {...item} 
                                    fetchData={fetchData} 
                                    setRemoving={setRemoving} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <ShoppingCartIcon className="mx-auto mb-4 text-gray-500" size={48} />
                            <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
                            <p className="text-gray-400 mb-6">
                                Browse the marketplace to find prompts you'll love
                            </p>
                            <Link to="/marketplace" className="bg-[#3ebb9e] hover:bg-[#00674f] text-white px-6 py-2 rounded-md font-medium transition-colors">
                                Explore Marketplace
                            </Link>
                        </div>
                    )}
                </div>
                <div>
                    {cartItems.length > 0 && (
                        <CartSummary 
                            subtotal={subtotal} 
                            prompts={cartItems} 
                            setCartItems={setCartItems}
                            onCheckoutSuccess={handleCheckoutSuccess}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}