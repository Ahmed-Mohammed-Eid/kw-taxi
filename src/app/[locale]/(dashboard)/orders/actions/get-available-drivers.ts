import axios from 'axios';

interface DriverLocation {
    type: string;
    coordinates: [number, number];
}

export interface Driver {
    location: DriverLocation;
    _id: string;
    driverId: string;
    phoneNumber: string;
    driverName: string;
    hasOrder: boolean;
    driverOnline: boolean;
    driverSuspended: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export async function getAvailableDrivers(orderId: string) {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.API_URL}/available/drivers?orderId=${orderId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data?.drivers || [] as Driver[];
    } catch (error) {
        console.error('Error fetching available drivers:', error);
        throw error;
    }
}
