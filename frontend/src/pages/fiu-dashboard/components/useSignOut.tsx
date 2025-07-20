import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useSignOut = () => {
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      // Make a request to the sign-out endpoint
      await axios.post('http://localhost:8000/org-auth/signout');

      // Clear the token from session storage
      sessionStorage.removeItem('accessToken');  // This is the token name used in the frontend

      // Redirect to the login page
      navigate('/login-org');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return signOut;
};

export default useSignOut;
