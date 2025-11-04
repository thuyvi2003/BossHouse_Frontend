// Vo Lam Thuy Vi
import React, { useEffect, useState } from "react";
import CartItem from "@/components/ui/Cart/CartItem";
import CartSummary from "@/components/ui/Cart/CartSummary";
import { clearAllCart, editCartItemQuantity, getUserCart, removeItem } from "@/services/cartService";
import { CheckSquare, Square } from "lucide-react";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);

  const fetchCart = async () => {
    try {
      const res = await getUserCart();
      const items = res.data?.items || [];
      setCart(items);
      setTotal(items.reduce((sum, item) => sum + (item.variation_id?.price || 0) * item.quantity, 0));
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // chọn / bỏ chọn 1 item
  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // chọn / bỏ chọn tất cả
  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) setSelectedItems([]);
    else setSelectedItems(cart.map((i) => i._id));
  };


  const handleIncrease = async (item) => {
    try {
      const updated = await editCartItemQuantity(item._id, item.quantity + 1);
      setCart(updated.data?.items || []);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleDecrease = async (item) => {
    try {
      const updated = await editCartItemQuantity(item._id, item.quantity - 1);
      setCart(updated.data?.items || []);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleRemove = async (variationId) => {
    try {
      await removeItem(variationId);
      fetchCart();
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleClearAllCart = async () => {
    try {
      await clearAllCart();
      fetchCart();
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] px-8 pb-60 justify-center flex">
      <div className="w-full max-w-7xl px-10 py-10">
        <div className="w-full flex items-center justify-center">
          <img
            src="/src/assets/Meo_InCart.png"
            alt="BossHouse Logo"
            className="object-cover"
          />
        </div>

        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-light mb-10 text-gray-800">Your Bag</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left - Product list */}
          <div className="md:col-span-2">
            {/* Header */}
            <div className="grid grid-cols-6 font-semibold border-b pb-2 text-gray-600 text-sm items-center">
              <div
                className="flex items-center gap-2 cursor-pointer select-none col-span-1"
                onClick={toggleSelectAll}
              >
                {selectedItems.length === cart.length && cart.length > 0 ? (
                  <CheckSquare className="w-5 h-5 text-[#846551]" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
                <span>Select All</span>
              </div>
              <span className="col-span-2">Products</span>
              <span>Quantity</span>
              <span>Price</span>
              <span>Delete</span>
            </div>

            {/* List */}
            <div className="divide-y">
              {cart.length > 0 ? (
                cart.map((item) => {
                  const isSelected = selectedItems.includes(item._id);
                  return (
                    <div
                      key={item._id}
                      className={`grid grid-cols-6 items-center py-3 transition-all ${isSelected ? "bg-[#f9f6f3]" : ""
                        }`}
                    >
                      {/* Select checkbox */}
                      <div
                        className="flex justify-center cursor-pointer"
                        onClick={() => toggleSelectItem(item._id)}
                      >
                        {isSelected ? (
                          <CheckSquare className="text-[#846551] w-5 h-5" />
                        ) : (
                          <Square className="text-gray-400 w-5 h-5" />
                        )}
                      </div>

                      {/* Product info */}
                      <div className="col-span-5">
                        <CartItem
                          item={item}
                          onIncrease={() => handleIncrease(item)}
                          onDecrease={() => handleDecrease(item)}
                          onRemove={() => handleRemove(item.variation_id?._id)}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-400 py-10">Cart is empty</p>
              )}
            </div>

            {cart.length > 0 && (
              <div className="flex justify-between mt-4 items-center">
                <div className="text-sm text-gray-600">
                  {selectedItems.length > 0
                    ? `${selectedItems.length} item(s) selected`
                    : "No items selected"}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleClearAllCart}
                    className="px-6 py-2 bg-[#846551] text-white rounded hover:bg-[#5a4639] transition"
                  >
                    Clear All
                  </button>
              
                </div>
              </div>
            )}
          </div>

          {/* Right - Summary */}
          <CartSummary
            total={total}
            count={cart.length}
            cart={cart}
            selectedItems={selectedItems}
          />

        </div>
      </div>
    </div>
  );
}
