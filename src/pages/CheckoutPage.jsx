// Vo Lam Thuy Vi
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createOrder } from "@/services/orderService";
import Toast from "@/components/Layout/Toast";
import CheckoutForm from "@/components/ui/Checkout/CheckoutForm";

export default function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const { total = 0, promotion = null, selectedItemIds } = location.state || {};
    const [shippingFee, setShippingFee] = useState();
    const [shippingFee, setShippingFee] = useState(0);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState(null); //Day la AddressInfo

    const handleCheckoutSubmit = async (data) => {
        const { contact, shipping, payment } = data;
        const shippingFee = data.shippingFee;

        const addressInfo = {
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            country: shipping.country,
            province: shipping.province,
            district: shipping.district,
            ward: shipping.ward,
            address: shipping.address,
            payment_method: payment.method,
        };

        setLoading(true);
        try {
            const promoCode = promotion?.code ? promotion.code : null;
            console.log("Creating order with promo:", promotion?.code || "no promotion");

            const res = await createOrder(
                selectedItemIds,
                promoCode,
                shippingFee,
                addressInfo
            );
            setToast({
                type: "success",
                title: "Order Created!",
                message: "Your order has been placed successfully.",
            });
            setTimeout(() => navigate("/profile/orders/my", { state: { order: res.data } }), 1500);
        } catch (error) {
            setToast({
                type: "error",
                title: "Failed",
                message: error.response?.data?.message || "Failed to create order",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfcfb]">
            <div className="mb-8 max-w-6xl mx-auto">
                <nav className="flex items-center text-sm text-gray-500 mb-2">
                    <Link to="/" className="hover:text-[#846551] transition">
                        Home
                    </Link>
                    <span className="mx-2">›</span>
                    <Link to="/cart" className="hover:text-[#846551] transition">
                        Cart
                    </Link>
                    <span className="mx-2">›</span>
                    <span className="text-2xl font-semibold text-[#5a4639] mb-3">Checkout</span>
                </nav>
                <hr className="border-gray-300" />
            </div>
            <div className=" flex justify-center py-10 gap-6">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
                    <CheckoutForm
                        onSubmit={(data) => setFormData(data)}
                        onShippingFeeChange={setShippingFee}
                    />
                </div>

                {/* order summary */}
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
                    <h1 className="text-2xl font-semibold mb-6 text-[#5a4639]">
                        Order Summary
                    </h1>

                    <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Subtotal (Cart Items)</span>
                            <span>{total.toLocaleString("vi-VN")}đ</span>
                        </div>

                        {promotion && (
                            <>
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">
                                        Promotion Code ({promotion.code})
                                    </span>
                                    <span className="text-[#846551]">
                                        {promotion.type === "percent"
                                            ? `-${promotion.value}%`
                                            : `-${promotion.value.toLocaleString("vi-VN")}đ`}
                                    </span>
                                </div>

                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Total after Promotion</span>
                                    <span className="text-gray-800 font-medium">
                                        {promotion.type === "percent"
                                            ? (total * (1 - promotion.value / 100)).toLocaleString("vi-VN")
                                            : Math.max(total - promotion.value, 0).toLocaleString("vi-VN")}đ
                                    </span>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Shipping Fee</span>
                            <span> {shippingFee ? shippingFee.toLocaleString("vi-VN") + 'đ' : '-'}</span>
                        </div>

                        <div className="flex justify-between font-semibold text-lg py-3 mt-2 bg-[#f8f4f0] px-2 rounded">
                            <span>Final Total</span>
                            <span>
                                {(() => {
                                    let discounted =
                                        promotion?.type === "percent"
                                            ? total * (1 - promotion.value / 100)
                                            : promotion
                                                ? Math.max(total - promotion.value, 0)
                                                : total;
                                    return (discounted + shippingFee).toLocaleString("vi-VN");
                                })()}đ
                            </span>
                        </div>

                        {/* Checkbox + T&C */}
                        <div className="flex items-center gap-2 mt-4">
                            <input
                                id="terms"
                                type="checkbox"
                                className="w-4 h-4 accent-[#846551] cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                By proceeding I accept the{" "}
                                <Link
                                    to="/terms"
                                    className="text-[#846551] hover:underline font-medium"
                                >
                                    Terms & Conditions
                                </Link>
                            </label>
                        </div>

                        <button
                            disabled={loading}
                            onClick={() => {
                                if (!document.getElementById("terms").checked) {
                                    setToast({
                                        type: "error",
                                        title: "Required",
                                        message:
                                            "Please accept Terms & Conditions before proceeding",
                                    });
                                    return;
                                }
                                if (!formData) {
                                    setToast({
                                        type: "error",
                                        title: "Missing Info",
                                        message: "Please complete your checkout information first",
                                    });
                                    return;
                                }
                                handleCheckoutSubmit(formData);
                            }}
                            className="w-full bg-[#846551] text-white py-3 text-sm uppercase tracking-wider rounded hover:bg-[#6d5041] transition disabled:opacity-50"
                        >
                            {loading ? "Processing..." : "Pay now"}
                        </button>
                    </div>

                    {toast && (
                        <Toast
                            type={toast.type}
                            title={toast.title}
                            message={toast.message}
                            onClose={() => setToast(null)}
                        />
                    )}
                </div>

            </div>



        </div>
    );
}
