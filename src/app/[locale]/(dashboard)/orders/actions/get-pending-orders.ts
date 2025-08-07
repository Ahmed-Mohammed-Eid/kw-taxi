import axios from 'axios';

// Coordinates (Latitude and Longitude)
export interface Coordinates {
    lat: number;
    lng: number;
}

// Destination item inside an order
export interface Destination {
    fromPoint: Coordinates;
    toPoint: Coordinates;
    fromAddress: string;
    toAddress: string;
    _id: string;
}

// Order status history
export interface OrderStatus {
    state: string; // e.g., "pending"
    date: string; // ISO date string
    _id: string;
}

// Individual Order
export interface Order {
    _id: string;
    orderNumber: number;
    destination: Destination[];
    clientName: string;
    orderDate: string; // ISO date string
    orderTime: string; // Time in HH:mm format
    serviceType: string; // e.g., "transportation"
    orderPrice: number;
    paymentType: string; // e.g., "cash"
    paymentStatus: string; // e.g., "Pending Payment"
    paymentMethod: string; // e.g., "knet"
    orderStatus: OrderStatus[];
    distancePerKm: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    __v: number;

    // Optional fields (only present in some orders)
    clientId?: string;
}

// Root response structure
export interface PendingOrdersResponse {
    success: boolean;
    pendingOrders: Order[];
}

export async function getPendingOrders(): Promise<PendingOrdersResponse> {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${process.env.API_URL}/all/pending/orders`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return {
            success: response.status === 200,
            pendingOrders: response.data.pendingOrders || []
        };
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        return {
            success: false,
            pendingOrders: []
        };
    }
}
