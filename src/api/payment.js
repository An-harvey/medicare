/**
 * paymentApi — lo_trinh.txt §19
 * ──────────────────────────────────────────────────────────
 *
 * LUỒNG A — VNPay Online (Patient):
 *   1. GET /payment/create-vnpay/{appointmentId} → { paymentUrl, message }
 *      → window.location.href = paymentUrl
 *   2. VNPay IPN → backend cập nhật DB (FE không làm gì)
 *   3. VNPay return → backend redirect về:
 *      /payment/result?status=success&paymentId={paymentId}
 *      /payment/result?status=failed&message={msg}
 *      /payment/result?status=invalid&message={msg}
 *   4. FE polling: GET /payment/check-status/{paymentId} → "PAID"|"UNPAID"|"REFUNDED"|"CANCELLED"
 *
 * LUỒNG B — Tiền mặt tại quầy (Staff):
 *   PUT /staff/payments/{appointmentId}/pay-cash → String
 *   → Side effect: CONFIRMED → CHECK_IN
 *
 * PaymentStatus: UNPAID | PAID | REFUNDED | CANCELLED
 * PaymentMethod: ONLINE | CASH
 */
import api from './config';

/** Patient: tạo link VNPay — không cần token */
export const createVnPayLink = (appointmentId) =>
  api.get(`/payment/create-vnpay/${appointmentId}`);

/**
 * FE polling sau khi redirect về /payment/result
 * Trả về plain string: "PAID" | "UNPAID" | "REFUNDED" | "CANCELLED"
 * paymentId = UUID của Payment (từ query param ?paymentId= trên URL)
 */
export const checkPaymentStatus = (paymentId) =>
  api.get(`/payment/check-status/${paymentId}`);

/** Staff: thu tiền mặt */
export const confirmCashPayment = (appointmentId) =>
  api.put(`/staff/payments/${appointmentId}/pay-cash`);
