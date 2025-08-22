const BASE_URL = "http://localhost:3000/api";
import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const evalResult = async (formData: any) => {

 try {
    const response = await axiosInstance.post(`${BASE_URL}/transcribe`, formData);
    return response.data; 
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || `HTTP error! Status: ${error.response?.status}`;
      console.error("Error getting users:", errorMessage);
      throw new Error(errorMessage);
    }
    console.error("Error getting users:", error);
    throw error;
  }
    
};



