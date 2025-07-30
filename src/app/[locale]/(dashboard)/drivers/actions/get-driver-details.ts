import axios from "axios";
import { Driver } from './get-drivers';

/**
 * Fetches driver details by ID
 * @param driverId The ID of the driver to fetch
 * @returns Driver details object
 */
export const getDriverDetails = async (driverId: string) => {
  const token = localStorage.getItem("token");
  
  try {
    const response = await axios.get(`${process.env.API_URL}/driver/details`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      params: { driverId }
    });
    return response.data.driver as Driver;
  } catch (error) {
    console.error("Error fetching driver details:", error);
    throw error;
  }
};