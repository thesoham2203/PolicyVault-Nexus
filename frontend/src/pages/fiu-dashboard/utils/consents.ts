import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const backendUrl = `${import.meta.env.NEXT_PUBLIC_BACKEND_URL}/consents`;
    //const backendUrl = "http://localhost:8000/consents";
    console.log("Fetching consents from:", backendUrl);  // Debug logging
    
    const response = await axios.get(backendUrl, {
      headers: {
        Authorization: req.headers.authorization || ''
      }
    });
    
    console.log("Backend response:", response.data);  // Debug logging
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("API Error:", error);  // Debug logging
    res.status(error.response?.status || 500).json({ 
      message: error.message,
      response: error.response?.data 
    });
  }
}