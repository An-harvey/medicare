/**
 * Dashboard — Router cho tất cả role
 * ──────────────────────────────────
 * Routes theo lo_trinh.txt mục 8:
 *
 * ADMIN  : dashboard, users, doctors, specialties, diseases, medicines,
 *          time-slots, schedules, payments, reports
 * DOCTOR : dashboard, schedule, patients, prescription, profile
 * STAFF  : dashboard, checkin, queue, bookings, profile
 * PATIENT: dashboard, bookings, records, profile
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import AppSidebar    from '../components/common/AppSidebar';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useAuth }   from '../context/AuthContext';

/* ── Role home ── */
import PatientDashboard from './patient/PatientDashboard';
import DoctorDashboard  from './doctor/DoctorDashboard';
import AdminDashboard   from './admin/DashboardPage';
import StaffDashboard   from './staff/StaffDashboard';

/* ── Shared ── */
import PatientProfilePage from './patient/PatientProfilePage';
import SettingsPage       from './dashboard/shared/SettingsPage';

/* ── PATIENT ── */
import AppointmentHistoryPage from './patient/AppointmentHistoryPage';
import MedicalRecordsPage     from './patient/MedicalRecordsPage';

/* ── DOCTOR ── */
import DoctorSchedulePage          from './doctor/DoctorSchedulePage';
import DoctorAppointmentHistoryPage from './doctor/AppointmentHistoryPage';
import CreateMedicalRecordPage      from './doctor/CreateMedicalRecordPage';
import DoctorProfilePage            from './doctor/DoctorProfilePage';

/* ── ADMIN ── */
import UsersPage       from './admin/UsersPage';
import DoctorsPage     from './admin/DoctorsPage';
import SpecialtiesPage from './admin/SpecialtiesPage';
import DiseasesPage    from './admin/DiseasesPage';
import MedicinesPage   from './admin/MedicinesPage';
import TimeSlotsPage   from './admin/TimeSlotsPage';
import SchedulesPage   from './admin/SchedulesPage';
import PaymentsPage    from './admin/PaymentsPage';
import ReportsPage     from './admin/ReportsPage';
// ── AdminScheduleAssign: vẫn còn ở path cũ, dùng SchedulesPage thay thế ──

/* ── STAFF ── */
import AppointmentSearchPage from './staff/AppointmentSearchPage';
import BookForPatientPage    from './staff/BookForPatientPage';

export default function Dashboard() {
  const { user } = useAuth();

  const homeEl = {
    user:   <PatientDashboard />,
    doctor: <DoctorDashboard />,
    admin:  <AdminDashboard />,
    staff:  <StaffDashboard />,
  }[user.role] || <PatientDashboard />;

  return (
    <AppSidebar>
      <ErrorBoundary>
        <Routes>
        {/* ── Index: home theo role ── */}
        <Route index element={homeEl} />

        {/* ══════════ PATIENT routes ══════════ */}
        <Route path="bookings" element={<AppointmentHistoryPage />} />
        <Route path="records"  element={<MedicalRecordsPage />} />

        {/* ══════════ DOCTOR routes ══════════ */}
        <Route path="schedule"     element={<DoctorSchedulePage />} />
        <Route path="patients"     element={<DoctorAppointmentHistoryPage />} />
        <Route path="prescription" element={<CreateMedicalRecordPage />} />
        <Route path="doctor-profile" element={<DoctorProfilePage />} />

        {/* ══════════ ADMIN routes ══════════ */}
        <Route path="users"       element={<UsersPage />} />
        <Route path="doctors"     element={<DoctorsPage />} />
        <Route path="specialties" element={<SpecialtiesPage />} />
        <Route path="diseases"    element={<DiseasesPage />} />
        <Route path="medicines"   element={<MedicinesPage />} />
        <Route path="time-slots"  element={<TimeSlotsPage />} />
        <Route path="schedules"   element={<SchedulesPage />} />
        {/* assign đã gộp vào schedules */}
        <Route path="assign"      element={<SchedulesPage />} />
        <Route path="payments"    element={<PaymentsPage />} />
        <Route path="reports"     element={<ReportsPage />} />
        <Route path="settings"    element={<SettingsPage />} />

        {/* ══════════ STAFF routes ══════════ */}
        <Route path="checkin"        element={<AppointmentSearchPage />} />
        <Route path="queue"          element={<AppointmentSearchPage />} />
        <Route path="book-patient"   element={<BookForPatientPage />} />

        {/* ══════════ Shared routes ══════════ */}
        <Route path="profile"     element={<PatientProfilePage />} />
        <Route path="my-settings" element={<SettingsPage />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ErrorBoundary>
    </AppSidebar>
  );
}
