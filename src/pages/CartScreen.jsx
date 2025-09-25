// Vo Lam Thuy Vi
import React, { useEffect, useState } from "react";
import CartItem from "@/components/ui/Cart/CartItem";
import CartSummary from "@/components/ui/Cart/CartSummary";
import { addToCart, getUserCart } from "@/services/cartService";

export default function Cart() {
  const [cart, setCart] = useState([]);
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await getUserCart();
        setCart(res.data?.items|| []);
        console.log("ALOOOOOOOOOOOOOOO")
      } catch (error) {
        console.error(error.message)
      }
    };
    fetchCart();
   }, [])
  const handleIncrease = (id) => {
    setCart(
      cart.map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleRemove = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleClearAllCart = () => {
    setCart([]);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-[#fdfaf6] px-8 pb-60 justify-center flex">
      <div className="w-full max-w-7xl px-10 py-10">
        <div className="w-full flex items-center justify-center">
          <img
            src="/src/assets/Meo_InCart.png"
            alt="BossHouse Logo"
            className=" object-cover "
          />
        </div>
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-light mb-10 text-gray-800">Your Bag</h1>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left - Product list */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-5 font-semibold border-b pb-2 text-gray-600 text-sm">
              <span className="col-span-2">Products</span>
              <span>Quantity</span>
              <span>Price</span>
              <span>Delete</span>
            </div>

            <div className="divide-y">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <CartItem
                    key={item._id}
                    item={item}
                    onIncrease={() => handleIncrease(item._id)}
                    onDecrease={handleDecrease}
                    onRemove={handleRemove}
                  />
                ))
              ) : (
                <p className="text-center text-gray-400 py-10">
                  Cart is empty
                </p>
              )}
            </div>
            {cart.length > 0 && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleClearAllCart}
                  className="px-6 py-2 bg-[#846551] text-white rounded hover:bg-red-600 transition"
                >
                  Clear All
                </button>
              </div>
            )}

          </div>


          {/* Right - Summary */}
          <CartSummary total={total} count={cart.length} />

        </div>
      </div>

    </div>
  );
}
