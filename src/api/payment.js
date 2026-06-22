/**
 * paymentApi — lo_trinh.txt §19
 * ──────────────────────────────────────────────────────────
 * PaymentStatus: UNPAID | PAID | REFUNDED | CANCELLED
 * PaymentMethod: ONLINE | CASH
 */
import api from './config';

/** Patient: tạo link VNPay (cần token) */
export const createVnPayLink = (appointmentId) =>
  api.get(`/payment/create-vnpay/${appointmentId}`);

/**
 * Patient: polling sau redirect về /payment/result
 * paymentId = UUID Payment (từ query param ?paymentId= trên URL)
 * Response: plain string "PAID"|"UNPAID"|"REFUNDED"|"CANCELLED"
 */
export const checkPaymentStatus = (paymentId) =>
  api.get(`/payment/check-status/${paymentId}`);

/**
 * Patient: lịch sử thanh toán của mình (có lọc + phân trang)
 * GET /patient/payments?status=&page=0&size=10&sortBy=id&direction=DESC
 * Response: Page<PaymentResponseDTO>
 * ⚠️ status trong response là enum name: "PAID"|"UNPAID"|"REFUNDED"|"CANCELLED"
 */
export const getMyPayments = (params = {}) =>
  api.get('/patient/payments', { params });

/** Staff: thu tiền mặt → side effect CONFIRMED → CHECK_IN */
export const confirmCashPayment = (appointmentId) =>
  api.put(`/staff/payments/${appointmentId}/pay-cash`);
