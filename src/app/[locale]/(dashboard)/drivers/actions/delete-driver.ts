
import axios from "axios";


/**
 * Deletes a driver by ID.
 * @param driverId The ID of the driver to delete.
 * @returns The response data from the API.
 */
export const deleteDriver = async (driverId: string) => {
	// GET TOKEN FROM LOCAL STORAGE
	const token = localStorage.getItem("token");

	try {
		const response = await axios.delete(`${process.env.API_URL}/delete/driver`, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			params: {
				driverId
			}
		});
		return response.data;
	} catch (error) {
		console.error("Error deleting driver:", error);
		throw error;
	}
};
