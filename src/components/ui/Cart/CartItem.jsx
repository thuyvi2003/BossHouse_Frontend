// Vo Lam Thuy Vi
import React from "react";

export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
    return (
        <div className="grid grid-cols-5 items-center py-4 border-b">
            <div className="col-span-2 flex items-center gap-4">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md border"
                />
                <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.price.toLocaleString()}₫ / Product</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onDecrease(item.id)}
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                >
                    -
                </button>
                <span>{item.quantity}</span>
                <button
                    onClick={() => onIncrease(item.id)}
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                >
                    +
                </button>
            </div>

            <div className="text-gray-700">
                {(item.price * item.quantity).toLocaleString()}₫
            </div>

            <button
                onClick={() => onRemove(item.id)}
                className="text-gray-400 hover:text-red-500 text-xl"
            >
                ×
            </button>
        </div>
    );
}
