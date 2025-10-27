// Vo Lam Thuy Vi
import React, { useState } from "react";

export default function CheckoutForm({ onSubmit }) {
    const [contact, setContact] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [delivery, setDelivery] = useState("standard");
    const [shipping, setShipping] = useState({
        country: "",
        city: "",
        address: "",
    });
    const [payment, setPayment] = useState({
        method: "cash",
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!contact.name.trim()) newErrors.name = "Full name is required";
        if (!contact.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(contact.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!contact.phone.trim()) newErrors.phone = "Phone number is required";

        if (!shipping.country.trim()) newErrors.country = "Country is required";
        if (!shipping.city.trim()) newErrors.city = "City is required";
        if (!shipping.address.trim()) newErrors.address = "Address is required";

        if (!payment.method) newErrors.payment = "Please select payment method";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault(); //Ngan cho reload trang khi submmit vi day la react
        if (!validate()) return;
        const data = { contact, delivery, shipping, payment };
        if (onSubmit) onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* CONTACT INFO */}
            <section>
                <h2 className="font-semibold text-lg text-[#5a4639] mb-3">
                    Contact Information
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <input
                            placeholder="Full Name"
                            value={contact.name}
                            onChange={(e) => setContact({ ...contact, name: e.target.value })}
                            className={`border p-2 rounded-md w-full ${errors.name ? "border-red-500" : "focus:outline-[#846551]"
                                }`}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div className="col-span-2">
                        <input
                            placeholder="Email address"
                            value={contact.email}
                            onChange={(e) =>
                                setContact({ ...contact, email: e.target.value })
                            }
                            className={`border p-2 rounded-md w-full ${errors.email ? "border-red-500" : "focus:outline-[#846551]"
                                }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div className="col-span-2">
                        <input
                            placeholder="+84"
                            type="number"
                            value={contact.phone}
                            onChange={(e) =>
                                setContact({ ...contact, phone: e.target.value })
                            }
                            className={`border p-2 rounded-md w-full ${errors.phone ? "border-red-500" : "focus:outline-[#846551]"
                                }`}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* DELIVERY METHOD */}
            <section>
                <h2 className="font-semibold text-lg text-[#5a4639] mb-3">
                    Delivery Method
                </h2>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 border p-2 rounded-md">
                        <input
                            type="radio"
                            name="delivery"
                            value="standard"
                            checked={delivery === "standard"}
                            onChange={() => setDelivery("standard")}
                        />
                        <span>Standard delivery (5–6 days) – FREE</span>
                    </label>
                    <label className="flex items-center gap-2 border p-2 rounded-md">
                        <input
                            type="radio"
                            name="delivery"
                            value="express"
                            checked={delivery === "express"}
                            onChange={() => setDelivery("express")}
                        />
                        <span>Express delivery (1–3 days) – 50.000đ</span>
                    </label>
                </div>
            </section>

            {/* SHIPPING INFO */}
            <section>
                <h2 className="font-semibold text-lg text-[#5a4639] mb-3">
                    Shipping Information
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <input
                            placeholder="Country"
                            value={shipping.country}
                            onChange={(e) =>
                                setShipping({ ...shipping, country: e.target.value })
                            }
                            className={`border p-2 rounded-md w-full ${errors.country ? "border-red-500" : "focus:outline-[#846551]"
                                }`}
                        />
                        {errors.country && (
                            <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                        )}
                    </div>
                    <div>
                        <input
                            placeholder="City"
                            value={shipping.city}
                            onChange={(e) =>
                                setShipping({ ...shipping, city: e.target.value })
                            }
                            className={`border p-2 rounded-md w-full ${errors.city ? "border-red-500" : "focus:outline-[#846551]"
                                }`}
                        />
                        {errors.city && (
                            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                        )}
                    </div>
                    <div className="col-span-2">
                        <input
                            placeholder="Address"
                            value={shipping.address}
                            onChange={(e) =>
                                setShipping({ ...shipping, address: e.target.value })
                            }
                            className={`border p-2 rounded-md w-full ${errors.address ? "border-red-500" : "focus:outline-[#846551]"
                                }`}
                        />
                        {errors.address && (
                            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* PAYMENT METHOD */}
            <section>
                <h2 className="font-semibold text-lg text-[#5a4639] mb-3">
                    Payment Method
                </h2>
                <div className="space-y-3">
                    <label className="flex items-center gap-2 border p-2 rounded-md cursor-pointer">
                        <input
                            type="radio"
                            name="payment"
                            value="cash"
                            checked={payment.method === "cash"}
                            onChange={() => setPayment({ ...payment, method: "cash" })}
                        />
                        <span>Cash on Delivery</span>
                    </label>

                    <label className="flex items-center gap-2 border p-2 rounded-md cursor-pointer">
                        <input
                            type="radio"
                            name="payment"
                            value="vnpay"
                            checked={payment.method === "vnpay"}
                            onChange={() => setPayment({ ...payment, method: "vnpay" })}
                        />
                        <span>VNPay (Online Payment)</span>
                    </label>

                    {errors.payment && (
                        <p className="text-red-500 text-xs mt-1">{errors.payment}</p>
                    )}
                </div>
            </section>


            <button
                type="submit"
                className="w-full bg-[#846551] text-white py-3 text-sm uppercase tracking-wider rounded hover:bg-[#6d5041] transition"
            >
                Continue
            </button>
        </form>
    );
}
