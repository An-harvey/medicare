import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header        from './components/Header';
import Footer        from './components/Footer';
import Home          from './pages/Home';
import Doctors       from './pages/Doctors';
import DoctorDetail  from './pages/DoctorDetail';
import Booking       from './pages/Booking';
import Packages      from './pages/Packages';
import News          from './pages/News';
import ArticleDetail from './pages/ArticleDetail';
import Search        from './pages/Search';
import Dashboard     from './pages/Dashboard';
import Login         from './pages/Login';
import Register      from './pages/Register';
import NotFound      from './pages/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

const NO_SHELL = ['/login', '/register', '/dashboard'];

function Layout() {
  const location = useLocation();
  const noShell = NO_SHELL.some((p) => location.pathname.startsWith(p));

  return (
    <div className={noShell ? '' : 'min-h-screen bg-gray-50 flex flex-col'}>
      {!noShell && <Header />}
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

          {/* Protected */}
          <Route path="/booking/:doctorId" element={
            <RequireAuth><Booking /></RequireAuth>
          } />
          <Route path="/dashboard/*" element={
            <RequireAuth><Dashboard /></RequireAuth>
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
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}
