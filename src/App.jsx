import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppHeader     from './components/common/AppHeader';
import Footer        from './components/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import Home          from './pages/Home';
import Doctors       from './pages/Doctors';
import DoctorDetail  from './pages/DoctorDetail';
import Booking       from './pages/patient/BookAppointmentPage';
import Packages      from './pages/Packages';
import News          from './pages/News';
import ArticleDetail from './pages/ArticleDetail';
import Search        from './pages/Search';
import Dashboard     from './pages/Dashboard';
import Login         from './pages/auth/LoginPage';
import Register      from './pages/auth/RegisterPage';
import NotFound      from './pages/NotFound';
import Unauthorized  from './pages/Unauthorized';
import { AuthProvider, useAuth } from './context/AuthContext';

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname + location.search } }}
      />
    );
  }
  return children;
}

const NO_SHELL = ['/login', '/register', '/dashboard'];

function Layout() {
  const location = useLocation();
  const noShell = NO_SHELL.some((p) => location.pathname.startsWith(p));

  return (
    <div className={noShell ? '' : 'min-h-screen bg-gray-50 flex flex-col'}>
      {!noShell && <AppHeader />}
      <main className={noShell ? '' : 'flex-grow'}>
        <Routes>
          {/* Public */}
          <Route path="/"              element={<Home />} />
          <Route path="/doctors"       element={<Doctors />} />
          <Route path="/doctors/:id"   element={<DoctorDetail />} />
          <Route path="/packages"      element={<Packages />} />
          <Route path="/news"          element={<News />} />
          <Route path="/news/:id"      element={<ArticleDetail />} />
          <Route path="/search"        element={<Search />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/unauthorized"  element={<Unauthorized />} />

          {/* Protected */}
          <Route path="/booking/:doctorId" element={
            <RequireAuth>
              <ErrorBoundary>
                <Booking />
              </ErrorBoundary>
            </RequireAuth>
          } />
          <Route path="/dashboard/*" element={
            <RequireAuth>
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            </RequireAuth>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!noShell && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Layout />
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}
