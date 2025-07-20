import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import UserDashboard from './pages/user-dashboard';
import FIUDashboard from './pages/fiu-dashboard';
import AdminDashboard from './pages/admin-dashboard';
import Login from './pages/user-login/Login';
import OrganizationRegister from './pages/org-login-register/OrganizationRegister';
import OrgLogin from './pages/org-login-register/Login';
import { useAuthh } from './pages/admin-dashboard/types/useAuthh';
import AdminLogin from './pages/admin-dashboard/components/AdminLogin';
import AdminRegister from './pages/admin-dashboard/components/AdminRegister';
import AdminProfile from './pages/admin-dashboard/components/AdminProfile';
function App() {
  const isLoggedIn = Boolean(localStorage.getItem('auth_token'));

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="login-user" element={<Login />}/>
      <Route path="/user" element={<UserDashboard />} />
      <Route path="/user" element={isLoggedIn ? <UserDashboard /> : <Navigate to="/login" replace />}
/>

      <Route path="/fiu-dashboard" element={<FIUDashboard />} />
      <Route path="/register-user" element={<OrganizationRegister />} />
      <Route path="/login-org" element={<OrgLogin />} />
      {/* <Route path="/admin" element={<AdminDashboard />} /> */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
      <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          ></Route>
      
    </Routes>
  );
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthh(); // Make sure this matches your hook name
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

export default App;
