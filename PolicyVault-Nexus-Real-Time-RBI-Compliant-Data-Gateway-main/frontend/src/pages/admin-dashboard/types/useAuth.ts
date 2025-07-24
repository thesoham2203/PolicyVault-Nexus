import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/me', {
          withCredentials: true
        });
        setIsAuthenticated(true);
        setAdminData(response.data);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string, otp: string) => {
    try {
      const response = await axios.post('http:localhost:8000/api/auth/login/verify', {
        email,
        password,
        otp
      }, {
        withCredentials: true
      });
      
      setIsAuthenticated(true);
      setAdminData(response.data.admin);
      navigate('/admin/dashboard');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setIsAuthenticated(false);
      setAdminData(null);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    adminData,
    login,
    logout
  };
};