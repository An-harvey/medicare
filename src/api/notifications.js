/**
 * notificationApi — /api/notifications (mọi role)
 * ──────────────────────────────────────────────────
 * lo_trinh.txt §22 — Notification API
 *
 * GET  /notifications           → NotificationResponseDTO[]
 *   { id, message, isRead, createdAt, link }
 *   Sắp xếp: mới nhất trước
 *
 * GET  /notifications/unread-count → number (plain long, không phải JSON object)
 *
 * PUT  /notifications/{id}/read → 204 No Content
 *
 * Notification tự động tạo từ BE khi:
 *   - Đặt lịch thành công → PATIENT
 *   - Staff check-in      → PATIENT
 *   - Bác sĩ tạo bệnh án (COMPLETED) → PATIENT
 *   - Hủy lịch            → PATIENT
 */
import api from './config';

export const getMyNotifications = () =>
  api.get('/notifications');

export const getUnreadCount = () =>
  api.get('/notifications/unread-count');

export const markNotificationRead = (id) =>
  api.put(`/notifications/${id}/read`);

/**
 * markAllRead — đánh dấu tất cả đã đọc
 * BE chưa có bulk API → loop từng cái
 */
export const markAllRead = async (notifications) => {
  const unread = notifications.filter(n => !n.isRead);
  await Promise.all(unread.map(n => markNotificationRead(n.id)));
};
