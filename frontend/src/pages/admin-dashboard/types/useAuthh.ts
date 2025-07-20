// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// export const useAuthh = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [adminData, setAdminData] = useState<any>(null);
//   const navigate = useNavigate();

//   // useEffect(() => {
//   //   const checkAuth = async () => {
//   //     try {
//   //       const response = await axios.get('/api/auth/me', {
//   //         withCredentials: true
//   //       });
//   //       setIsAuthenticated(true);
//   //       setAdminData(response.data);
//   //     } catch (error) {
//   //       setIsAuthenticated(false);
//   //     } finally {
//   //       setIsLoading(false);
//   //     }
//   //   };
    
//   //   checkAuth();
//   // }, []);

//   useEffect(() => {
//   const checkAuth = async () => {
//     try {
//       const response = await axios.get('http://localhost:8000/api/auth/me', {
//         withCredentials: true
//       });
//       setIsAuthenticated(true);
//       setAdminData(response.data);
//     } catch {
//       setIsAuthenticated(false);
//     }
//   };
//   checkAuth();
// }, []);

//   const login = async (token: string) => {
//     try {
//       // Store the token (implementation depends on your storage method)
//       // localStorage.setItem('authToken', token);
//       // setIsAuthenticated(true);
      
//       // // Fetch admin data
//       // const response = await axios.get('http://localhost:8000/api/auth/me', {
//       //   headers: {
//       //     Authorization: `Bearer ${token}`
//       //   }
//       // });
      
//       // setAdminData(response.data);
//       // navigate('/admin/dashboard');
//       // return { success: true };
//       setIsAuthenticated(true);
//     } catch (error: any) {
//       let errorMessage = 'Login failed';
//       if (axios.isAxiosError(error)) {
//         errorMessage = error.response?.data?.message || errorMessage;
//       }
//       return { success: false, error: errorMessage };
//     }
//   };

//   const logout = async () => {
//     try {
//       await axios.post('/api/auth/logout', {}, { withCredentials: true });
//       setIsAuthenticated(false);
//       setAdminData(null);
//       navigate('/admin/login');
//     } catch (error) {
//       console.error('Logout failed:', error);
//     }
//   };

//   return {
//     isAuthenticated,
//     isLoading,
//     adminData,
//     login,
//     logout
//   };
// };

import { useState, useEffect } from 'react';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

export const useAuthh = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);
  // const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/auth/me', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      setIsAuthenticated(true);
      setAdminData(response.data);
    } catch (error) {
      setIsAuthenticated(false);
      setAdminData(null);
    } finally {
      setIsLoading(false);
    }
  };
    
    checkAuth();
  }, []);

  // const login = async () => {
  //   try {
  //     const response = await axios.get('http://localhost:8000/api/auth/me', {
  //       withCredentials: true, // This is crucial for sending cookies
  //       // headers: {
  //       //   'Content-Type': 'application/json',
  //       //   'Accept': 'application/json'
  //       // }
  //     });
      
  //     if (response.data) {
  //       setIsAuthenticated(true);
  //       setAdminData(response.data);
  //       return { success: true };
  //     }
  //     return { success: false, error: "Not authenticated" };
  //   } catch (error: unknown) {
  //     setIsAuthenticated(false);
  //     setAdminData(null);
      
  //     let errorMessage = 'Login failed';
  //     if (axios.isAxiosError(error)) {
  //       errorMessage = error.response?.data?.message || errorMessage;
  //     }
  //     return { success: false, error: errorMessage };
  //   }
  // };

  const login = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/auth/me', {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data) {
      setIsAuthenticated(true);
      setAdminData(response.data);
      return { success: true };
    }
    return { success: false, error: "Not authenticated" };
  } catch (error: unknown) {
    setIsAuthenticated(false);
    setAdminData(null);
    
    let errorMessage = 'Login failed';
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.detail || errorMessage;
    }
    return { success: false, error: errorMessage };
  }
};
  const logout = async () => {
    try {
      await axios.post('http://localhost:8000/api/auth/logout', {}, { 
        withCredentials: true 
      });
      setIsAuthenticated(false);
      setAdminData(null);
      // navigate('/admin/login');
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