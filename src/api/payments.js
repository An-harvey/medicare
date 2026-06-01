/**
 * Payments API — Admin xem danh sách thanh toán
 */
import api from './config';

/**
 * Lấy danh sách giao dịch thanh toán (admin)
 * @param {{ page?, size?, startDate?, endDate?, status? }} params
 */
export const getPayments = (params = {}) =>
  api.get('/admin/payments', { params });

/**
 * Lấy chi tiết một giao dịch
 */
export const getPaymentById = (paymentId) =>
  api.get(`/admin/payments/${paymentId}`);

/**
 * Thống kê doanh thu (admin)
 * @param {{ year?, month? }} params
 */
export const getRevenueStats = (params = {}) =>
  api.get('/admin/payments/stats', { params });
