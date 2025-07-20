import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  try {
    const backendUrl = `${import.meta.env.NEXT_PUBLIC_BACKEND_URL}/consent/${id}`;
    //const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/consents`;
    //const backendUrl = `http://localhost:8000//consent/${id}`
    const response = await axios.get(backendUrl, {
      headers: {
        Authorization: req.headers.authorization
      }
    });
    res.status(200).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ message: error.message });
  }
}