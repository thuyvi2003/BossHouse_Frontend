// Vo Lam Thuy Vi
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CheckoutForm({  onSubmit, onShippingFeeChange }) {
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [delivery, setDelivery] = useState("standard");
  const [shipping, setShipping] = useState({
    country: "Vietnam",
    province: "", //Tinh
    district: "", //Huyen
    ward: "", //Xa
    address: "",
  });
  const [payment, setPayment] = useState({ method: "cash" });
  const [errors, setErrors] = useState({});
  const [shippingFee, setShippingFee] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const GHN_API = "https://online-gateway.ghn.vn/shiip/public-api/master-data";
  const GHN_TOKEN = import.meta.env.VITE_GHN_TOKEN || process.env.GHN_TOKEN;

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Fetch provinces
  useEffect(() => {
    axios
      .get(`${GHN_API}/province`, { headers: { Token: GHN_TOKEN } })
      .then((res) => setProvinces(res.data.data || []))
      .catch((err) => console.error("Failed to load provinces:", err));
  }, []);

  // Fetch districts
  useEffect(() => {
    if (!shipping.province) return;
    axios
      .post(`${GHN_API}/district`, { province_id: shipping.province }, { headers: { Token: GHN_TOKEN } })
      .then((res) => setDistricts(res.data.data || []))
      .catch((err) => console.error(" Failed to load districts:", err));
  }, [shipping.province]);

  // Fetch wards
  useEffect(() => {
    if (!shipping.district) return;
    axios
      .post(`${GHN_API}/ward`, { district_id: shipping.district }, { headers: { Token: GHN_TOKEN } })
      .then((res) => setWards(res.data.data || []))
      .catch((err) => console.error("Failed to load wards:", err));
  }, [shipping.district]);

  //  Auto calculate fee when 3 selects done
  useEffect(() => {
    if (shipping.province && shipping.district && shipping.ward) {
      handleCalculateShippingFee();
    }
  }, [shipping.province, shipping.district, shipping.ward]);

  const handleCalculateShippingFee = async () => {
    try {
      setIsCalculating(true);
      const res = await axios.post("http://localhost:3000/api/shipping/calculate-fee", {
        to_district: shipping.district,
        to_ward_code: shipping.ward,
        shop_id: 885, 
      });

      const shippingFee = res.data.data?.fee?.total || 0;
      setShippingFee(shippingFee);
   if (onShippingFeeChange) {
        onShippingFeeChange(shippingFee);
      }
    } catch (err) {
      console.error("Fee calculation failed:", err);
      setShippingFee(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!contact.name.trim()) newErrors.name = "Full name is required";
    if (!contact.email.trim()) newErrors.email = "Email is required";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(contact.email))
      newErrors.email = "Invalid email format";
    if (!contact.phone.trim()) newErrors.phone = "Phone number is required";
    if (!shipping.province) newErrors.province = "Please select a province";
    if (!shipping.district) newErrors.district = "Please select a district";
    if (!shipping.ward) newErrors.ward = "Please select a ward";
    if (!shipping.address.trim()) newErrors.address = "Address is required";
    if (!payment.method) newErrors.payment = "Please select payment method";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const data = { contact, delivery, shipping, payment, shippingFee };

onSubmit?.(data);
  if (res.data.success) {
    setSelectedOrder(res.data.order); 
    setShowOrderModal(true);
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* CONTACT INFO */}
      <section>
        <h2 className="font-semibold text-lg text-[#5a4639] mb-3">Contact Information</h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Full Name"
            value={contact.name}
            onChange={(e) => setContact({ ...contact, name: e.target.value })}
            className={`border p-2 rounded-md w-full ${
              errors.name ? "border-red-500" : "focus:outline-[#846551]"
            } col-span-2`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}

          <input
            placeholder="Email address"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            className={`border p-2 rounded-md w-full ${
              errors.email ? "border-red-500" : "focus:outline-[#846551]"
            } col-span-2`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}

          <input
            placeholder="+84"
            type="number"
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            className={`border p-2 rounded-md w-full ${
              errors.phone ? "border-red-500" : "focus:outline-[#846551]"
            } col-span-2`}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </section>

      {/* DELIVERY METHOD */}
      <section>
        <h2 className="font-semibold text-lg text-[#5a4639] mb-3">Delivery Method</h2>
        <div className="space-y-2">
          <label className="flex items-center justify-between border p-2 rounded-md">
            <span>
              Standard delivery (3–6 days)
              {isCalculating ? (
                <span className="text-gray-400 text-sm ml-2 animate-pulse">Calculating...</span>
              ) : shippingFee !== null ? (
                <span className="ml-2 text-[#846551] font-semibold">
                  {shippingFee.toLocaleString()} đ
                </span>
              ) : (
                <span className="ml-2 text-gray-400 text-sm">Select address</span>
              )}
            </span>
            <input
              type="radio"
              name="delivery"
              value="standard"
              checked={delivery === "standard"}
              onChange={() => setDelivery("standard")}
            />
          </label>
        </div>
      </section>

      {/* SHIPPING INFO */}
      <section>
        <h2 className="font-semibold text-lg text-[#5a4639] mb-3">Shipping Information</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Province */}
          <div>
            <select
              value={shipping.province}
              onChange={(e) =>
                setShipping({
                  ...shipping,
                  province: Number(e.target.value),
                  district: "",
                  ward: "",
                })
              }
              className={`border p-2 rounded-md w-full ${
                errors.province ? "border-red-500" : "focus:outline-[#846551]"
              }`}
            >
              <option value="">Select Province</option>
              {provinces.map((p) => (
                <option key={p.ProvinceID} value={p.ProvinceID}>
                  {p.ProvinceName}
                </option>
              ))}
            </select>
            {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
          </div>

          {/* District */}
          <div>
            <select
              value={shipping.district}
              onChange={(e) =>
                setShipping({
                  ...shipping,
                  district: Number(e.target.value),
                  ward: "",
                })
              }
              disabled={!shipping.province}
              className={`border p-2 rounded-md w-full ${
                errors.district ? "border-red-500" : "focus:outline-[#846551]"
              }`}
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.DistrictID} value={d.DistrictID}>
                  {d.DistrictName}
                </option>
              ))}
            </select>
            {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
          </div>

          {/* Ward */}
          <div className="col-span-2">
            <select
              value={shipping.ward}
              onChange={(e) => setShipping({ ...shipping, ward: e.target.value })}
              disabled={!shipping.district}
              className={`border p-2 rounded-md w-full ${
                errors.ward ? "border-red-500" : "focus:outline-[#846551]"
              }`}
            >
              <option value="">Select Ward</option>
              {wards.map((w) => (
                <option key={w.WardCode} value={w.WardCode}>
                  {w.WardName}
                </option>
              ))}
            </select>
            {errors.ward && <p className="text-red-500 text-xs mt-1">{errors.ward}</p>}
          </div>

          {/* Address */}
          <div className="col-span-2">
            <input
              placeholder="Detailed Address (e.g. 123 Nguyen Trai)"
              value={shipping.address}
              onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
              className={`border p-2 rounded-md w-full ${
                errors.address ? "border-red-500" : "focus:outline-[#846551]"
              }`}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>
        </div>
      </section>

      {/* PAYMENT METHOD */}
      <section>
        <h2 className="font-semibold text-lg text-[#5a4639] mb-3">Payment Method</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2 border p-2 rounded-md cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={payment.method === "cash"}
              onChange={() => setPayment({ method: "cash" })}
            />
            <span>Cash on Delivery</span>
          </label>
          <label className="flex items-center gap-2 border p-2 rounded-md cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="vnpay"
              checked={payment.method === "vnpay"}
              onChange={() => setPayment({ method: "vnpay" })}
            />
            <span>VNPay (Online Payment)</span>
          </label>
          {errors.payment && <p className="text-red-500 text-xs mt-1">{errors.payment}</p>}
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
