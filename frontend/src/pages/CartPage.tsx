import { ShoppingCartIcon, StarIcon, Trash2Icon } from 'lucide-react';

export default function CartPage(){
    return <div className="w-full pt-10 px-16 mx-auto" >
      <div className="flex items-center mb-8">
        <ShoppingCartIcon className="mr-3" size={24} />
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <span className="ml-3 text-gray-400">(4 items)</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 border-b border-gray-800">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-3 py-1 text-sm rounded-md bg-blue-900 text-blue-200`}>
                        Writing
                        </span>
                        <div className="flex items-center text-yellow-400">
                            <StarIcon size={16} fill="currentColor" />
                            <span className="ml-1 text-sm">4.8</span>
                        </div>
                    </div>
                      <h3 className="text-lg font-medium mb-1">Expert Content Writer</h3>
                    <div className="flex items-center text-gray-400 text-sm">
                          <span>by Content Pro</span>
                        <span className="mx-1">·</span>
                          <span>@writer_pro</span>
                    </div>
                </div>
                <div className="flex items-center mt-4 md:mt-0">
                      <span className="font-medium text-lg mr-6">$6.99</span>
                    <button className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <Trash2Icon size={18} />
                    </button>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 border-b border-gray-800">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-3 py-1 text-sm rounded-md bg-green-900 text-green-200`}>
                            Development
                        </span>
                        <div className="flex items-center text-yellow-400">
                            <StarIcon size={16} fill="currentColor" />
                            <span className="ml-1 text-sm">4.8</span>
                        </div>
                    </div>
                      <h3 className="text-lg font-medium mb-1">Expert Content Writer</h3>
                    <div className="flex items-center text-gray-400 text-sm">
                          <span>by Content Pro</span>
                        <span className="mx-1">·</span>
                          <span>@writer_pro</span>
                    </div>
                </div>
                <div className="flex items-center mt-4 md:mt-0">
                      <span className="font-medium text-lg mr-6">$6.99</span>
                    <button className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <Trash2Icon size={18} />
                    </button>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 border-b border-gray-800">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-3 py-1 text-sm rounded-md bg-pink-900 text-pink-200`}>
                        Design
                        </span>
                        <div className="flex items-center text-yellow-400">
                            <StarIcon size={16} fill="currentColor" />
                            <span className="ml-1 text-sm">4.8</span>
                        </div>
                    </div>
                      <h3 className="text-lg font-medium mb-1">Expert Content Writer</h3>
                    <div className="flex items-center text-gray-400 text-sm">
                          <span>by Content Pro</span>
                        <span className="mx-1">·</span>
                          <span>@writer_pro</span>
                    </div>
                </div>
                <div className="flex items-center mt-4 md:mt-0">
                      <span className="font-medium text-lg mr-6">$6.99</span>
                    <button className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <Trash2Icon size={18} />
                    </button>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 border-b border-gray-800">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-3 py-1 text-sm rounded-md bg-purple-900 text-purple-200`}>
                          Marketing
                        </span>
                        <div className="flex items-center text-yellow-400">
                            <StarIcon size={16} fill="currentColor" />
                            <span className="ml-1 text-sm">4.8</span>
                        </div>
                    </div>
                      <h3 className="text-lg font-medium mb-1">Expert Content Writer</h3>
                    <div className="flex items-center text-gray-400 text-sm">
                          <span>by Content Pro</span>
                        <span className="mx-1">·</span>
                          <span>@writer_pro</span>
                    </div>
                </div>
                <div className="flex items-center mt-4 md:mt-0">
                      <span className="font-medium text-lg mr-6">$6.99</span>
                    <button className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <Trash2Icon size={18} />
                    </button>
                </div>
            </div>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span>$19.97</span>
                </div>
                <div className="border-t border-gray-800 pt-3 flex justify-between font-medium">
                    <span>Total</span>
                    <span>$19.97</span>
                </div>
            </div>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium transition-colors">
                Proceed to Checkout
            </button>
            <button className="w-full text-center mt-4 text-green-500 hover:text-green-400">
                Continue Shopping
            </button>
        </div>
      </div>
    </div>
}