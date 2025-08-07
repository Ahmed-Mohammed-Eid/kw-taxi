import axios from 'axios';

// Coordinates interface
interface Coordinates {
    lat: number;
    lng: number;
}

// Destination within an order
interface Destination {
    fromPoint: Coordinates;
    toPoint: Coordinates;
    fromAddress: string;
    toAddress: string;
    _id: string;
}

// Status entry in order history
interface OrderStatus {
    state: string; // e.g., "pending"
    date: string; // ISO date string
    _id: string;
}

// Main Order interface
export interface Order {
    _id: string;
    orderNumber: number;
    destination: Destination[];
    clientName: string;
    orderDate: string; // ISO date string
    orderTime: string; // Time in HH:mm format
    serviceType: string;
    orderPrice: number;
    paymentType: string;
    paymentStatus: string;
    paymentMethod: string;
    orderStatus: OrderStatus[];
    distancePerKm: number;
    createdAt: string;
    updatedAt: string;
    __v: number;

    // Optional or nullable fields
    clientId?: string | null; // Can be string, null, or missing
}

export type Filter = {
    dateFrom: Date | null;
    dateTo: Date | null;
};

export async function getAllOrders(filter: Filter) {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.API_URL}/all/orders?dateFrom=${filter.dateFrom}&dateTo=${filter.dateTo}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return {
            success: true,
            orders: response.data.orders as Order[]
        };
    } catch (error) {
        console.error('Error fetching all orders:', error);
    }
}
