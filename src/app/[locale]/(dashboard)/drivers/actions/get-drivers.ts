import axios from "axios";

export const getDrivers = async () => {
    // GET TOKEN FROM LOCAL STORAGE
    const token = localStorage.getItem("token");

    try {
        const response = await axios.get(`${process.env.API_URL}/all/drivers`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // You can add any additional parameters or configurations here if needed
        });
        return response.data?.drivers as Driver[];
    } catch (error) {
        console.error("Error fetching drivers:", error);
        throw error;
    }
};

// DRIVER  INTERFACE
export interface Driver {
    _id: string;
    driverName: string;
    phoneNumber: string;
    licenseNumber: string;
    companyName: string;
    carNumber: string;
    driverDocs: string[];
    isActive: boolean;
    isApproved: boolean;
    password: string;
    role: string;
    averageRating: number;
    ratings: number;
    reviewers: number;
    declinedOrders: string[];
    walletId: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    driverLogId: string;
}
