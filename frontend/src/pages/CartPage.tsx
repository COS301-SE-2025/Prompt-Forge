import { useEffect, useState } from 'react';
import { CartSummary } from '@/components/CartSummary';
import { ShoppingCartIcon } from 'lucide-react';
import { CartItem } from '@/components/CartItem';
import { Link } from 'react-router-dom';
import { CartService } from '@/services/cartServices';
import { CartPrompt, EnrichedPrompt } from '@/Models/CartPrompt';
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
            <div className="flex justify-center items-center h-screen px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
                    <p className="text-sm sm:text-base text-muted-foreground">Loading Cart...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full pt-4 sm:pt-6 lg:pt-10 px-3 sm:px-6 lg:px-16 mx-auto max-w-7xl">
            {/* Header - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 lg:mb-8">
                <div className="flex items-center mb-2 sm:mb-0">
                    <ShoppingCartIcon className="mr-2 sm:mr-3" size={20} sm-size={24} />
                    <h1 className="text-xl sm:text-2xl font-bold">Your Cart</h1>
                </div>
                <span className="text-sm sm:text-base text-gray-400 sm:ml-3">
                    ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                </span>
            </div>

            {/* Main Content - Mobile Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Cart Items Section */}
                <div className={`${cartItems.length > 0 ? "lg:col-span-2" : "lg:col-span-3"} order-1 lg:order-1`}>
                    {cartItems.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4">
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
                        <div className="text-center py-8 sm:py-12 px-4">
                            <ShoppingCartIcon className="mx-auto mb-4 text-gray-500" size={36} sm-size={48} />
                            <h3 className="text-lg sm:text-xl font-medium mb-2">Your cart is empty</h3>
                            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed">
                                Browse the marketplace to find prompts you'll love
                            </p>
                            <Link 
                                to="/marketplace" 
                                className="inline-block bg-[#3ebb9e] hover:bg-[#00674f] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-colors text-sm sm:text-base"
                            >
                                Explore Marketplace
                            </Link>
                        </div>
                    )}
                </div>

                {/* Cart Summary Section - Mobile: Show at bottom, Desktop: Show on right */}
                <div className="order-2 lg:order-2">
                    {cartItems.length > 0 && (
                        <div className="lg:sticky lg:top-6">
                            <CartSummary 
                                subtotal={subtotal} 
                                prompts={cartItems} 
                                onCheckoutSuccess={handleCheckoutSuccess}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Footer Spacing */}
            <div className="h-4 sm:h-6 lg:h-8"></div>
        </div>
    )
}