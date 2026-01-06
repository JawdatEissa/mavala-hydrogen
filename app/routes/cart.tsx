import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Shopping Cart | Mavala Switzerland' },
  ];
};

export default function CartPage() {
  // Mock empty cart for now
  const cartItems: any[] = [];
  const cartTotal = 0;

  return (
    <div className="pt-[104px] md:pt-[112px]">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-display font-light tracking-[0.15em] uppercase text-center mb-12">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-mavala-gray mb-6">Your cart is empty</p>
            <Link to="/collections/all" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="grid grid-cols-12 gap-4 text-sm text-mavala-gray uppercase tracking-wider">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
              </div>
              
              {/* Cart items would go here */}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-mavala-light-gray p-6">
                <h2 className="text-lg font-medium uppercase tracking-wider mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-mavala-gray">Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mavala-gray">Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-300 pt-4 mb-6">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)} AUD</span>
                  </div>
                </div>
                
                <button className="w-full btn-primary py-4">
                  Proceed to Checkout
                </button>
                
                <p className="text-xs text-mavala-gray text-center mt-4">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}













