/**
 * staffAppointment.js — Luồng staff theo lo_trinh.txt §5, §10
 *
 * Staff thao tác 2 bước tại quầy:
 *   PENDING  → [Xác nhận]  → CONFIRMED
 *   CONFIRMED → [Check-in] → CHECK_IN
 *
 * Staff đặt hộ tại quầy → CONFIRMED (bỏ qua PENDING)
 * Bác sĩ: CHECK_IN → IN_PROGRESS → COMPLETED
 */

export const STAFF_APPOINTMENT_STATUS = {
  PENDING: {
    label: 'Chờ xác nhận',
    cls: 'bg-yellow-100 text-yellow-700',
    dot: 'bg-yellow-500',
    action: '✓ Xác nhận',
    nextStatus: 'CONFIRMED',
    actionCls: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    cls: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
    action: 'Check-in',
    nextStatus: 'CHECK_IN',
    actionCls: 'bg-purple-600 text-white hover:bg-purple-700',
  },
  CHECK_IN: {
    label: 'Đã check-in',
    cls: 'bg-cyan-100 text-cyan-700',
    dot: 'bg-cyan-500',
    action: null,
    nextStatus: null,
    waitingLabel: 'Chờ bác sĩ',
  },
  IN_PROGRESS: {
    label: 'Đang khám',
    cls: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
    action: null,
    nextStatus: null,
    waitingLabel: 'Đang khám',
  },
  COMPLETED: {
    label: 'Hoàn tất',
    cls: 'bg-gray-100 text-gray-500',
    dot: 'bg-gray-300',
    action: null,
    nextStatus: null,
  },
  CANCELLED: {
    label: 'Đã hủy',
    cls: 'bg-red-100 text-red-500',
    dot: 'bg-red-400',
    action: null,
    nextStatus: null,
  },
};

export function getStaffStatusMeta(status) {
  return STAFF_APPOINTMENT_STATUS[status] || {
    label: status,
    cls: 'bg-gray-100 text-gray-500',
    dot: 'bg-gray-400',
    action: null,
    nextStatus: null,
  };
}

export function staffActionToast(nextStatus) {
  if (nextStatus === 'CONFIRMED') return '✓ Đã xác nhận lịch hẹn!';
  if (nextStatus === 'CHECK_IN') return '✅ Check-in thành công!';
  if (nextStatus === 'CANCELLED') return 'Đã hủy lịch hẹn.';
  return 'Đã cập nhật trạng thái.';
}

export function canStaffCancel(status) {
  return status === 'PENDING' || status === 'CONFIRMED';
}
