/**
 * notificationApi — /notifications (mọi role) — lo_trinh.txt §13.6
 */
import api from './config';

export const getMyNotifications = () =>
  api.get('/notifications');

export const getUnreadCount = () =>
  api.get('/notifications/unread-count');

export const markNotificationRead = (id) =>
  api.put(`/notifications/${id}/read`);
