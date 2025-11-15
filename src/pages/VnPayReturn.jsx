import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { verifyVnpayReturn } from "@/services/orderService";

export default function VnpayReturn() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState({
    status: "loading",
    message: "",
  });
  console.log("alo alo alo: ");
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const queryObj = {};
    searchParams.forEach((value, key) => {
      queryObj[key] = value;
    });

    verifyVnpayReturn(queryObj)
      .then((api) => {
        console.log("API RESULT:", api);

        if (api.success === true) {
          const data = api.data;

          setResult({
            status: "success",
            message: "Thanh toán thành công!",
            orderId: data.vnp_TxnRef,
            amount: data.vnp_Amount,
            bank: data.vnp_BankCode,
            payDate: data.vnp_PayDate,
          });
        } else {
          setResult({
            status: "fail",
            message: api.message || "Thanh toán thất bại!",
            orderId: api.orderId || "",
          });
        }
      })
      .catch(() => {
        setResult({
          status: "fail",
          message: "Lỗi khi xác thực giao dịch!",
        });
      });
  }, [searchParams]);

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "50px auto",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #eee",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      {result.status === "loading" && <h2>Đang xử lý thanh toán...</h2>}

      {result.status === "success" && (
        <>
          <h2 style={{ color: "green" }}>✔ Thanh toán thành công!</h2>
          <p>
            <b>Mã đơn hàng:</b> {result.orderId}
          </p>
          <p>
            <b>Số tiền:</b> {(result.amount / 100).toLocaleString("vi-VN")} đ
          </p>
          <p>
            <b>Ngân hàng:</b> {result.bank}
          </p>
          <p>
            <b>Thời gian:</b> {result.payDate}
          </p>

          <button
            onClick={() => (window.location.href = "/profile/orders/my")}
            style={{
              padding: "12px 20px",
              background: "green",
              color: "#fff",
              borderRadius: "10px",
              border: "none",
              marginTop: "20px",
              cursor: "pointer",
            }}
          >
            Xem đơn hàng
          </button>
        </>
      )}

      {result.status === "fail" && (
        <>
          <h2 style={{ color: "red" }}>✘ Thanh toán thất bại</h2>
          <p>{result.message}</p>
          <p>
            <b>Mã đơn hàng:</b> {result.orderId}
          </p>

          <button
            onClick={() => (window.location.href = "/cart")}
            style={{
              padding: "12px 20px",
              background: "red",
              color: "#fff",
              borderRadius: "10px",
              border: "none",
              marginTop: "20px",
              cursor: "pointer",
            }}
          >
            Quay lại giỏ hàng
          </button>
        </>
      )}
    </div>
  );
}
