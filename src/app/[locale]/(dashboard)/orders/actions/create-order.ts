import axios from 'axios';

export type DestinationPoint = {
    fromPoint: {
        lat: number;
        lng: number;
    },
    toPoint: {
        lat: number;
        lng: number;
    },
    fromAddress: string;
    toAddress: string;
}

export interface CreateOrderRequestData {
    clientName: string;
    clientPhone: string;
    orderDate: Date;
    orderTime: string;
    destination: DestinationPoint[];
    serviceType: 'transportation' | 'shipping';
    orderPrice: number;
    paymentType: 'subscription' | 'cash';
    paymentMethod: 'cash' | 'knet' | 'link' | 'subscription';
    distancePerKm: number;
}

export async function createOrder(requestData: CreateOrderRequestData): Promise<void> {
    // Get the token from the local storage
    const token = localStorage.getItem('token');

    try {
        axios
            .post(`${process.env.API_URL}/create/order`, requestData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {})
            .catch((error) => {
                console.error('Error creating order:', error);
            });
    } catch (error) {
        console.error('Error creating order:', error);
    }
}
