import axios from 'axios';
import { RouteData } from '../components/map-points/map-route-selector';

interface Coordinates {
    type: 'LineString';
    coordinates: [number, number][]; // [longitude, latitude][]
}

export interface DeliveryRoute {
    deliveryRoute: Coordinates;
    distance: number;
    estimatedTime: number;
    price: number;
}

export interface LocationsData {
    locationsData: DeliveryRoute[];
    price: number;
}

type DestinationType = {
    fromPointLat: number;
    fromPointLng: number;
    fromAddress: string;
    toPointLat: number;
    toPointLng: number;
    toAddress: string;
}


export async function calculateDeliveryData(serviceType: string, routeData: RouteData): Promise<LocationsData | null> {
    const {fromPoints, toPoints} = routeData;
    const destinationsArray: DestinationType[] = [];

    fromPoints.forEach((fromPoint, index) => {
        destinationsArray[index] = {
            fromPointLat: fromPoint.coordinates.lat,
            fromPointLng: fromPoint.coordinates.lng,
            fromAddress: fromPoint.address,
            toPointLat: 0, // Placeholder, will be filled later
            toPointLng: 0, // Placeholder, will be filled later
            toAddress: '', // Placeholder, will be filled later
        }
    });
    toPoints.forEach((toPoint, index) => {
        destinationsArray[index] = {
            ...destinationsArray[index],
            toPointLat: toPoint.coordinates.lat,
            toPointLng: toPoint.coordinates.lng,
            toAddress: toPoint.address,
        }
    });

    console.log('Destinations Array:', destinationsArray);

    // GET TOKEN FROM LOCAL STORAGE
    const token = localStorage.getItem('token');

    try {
        const response = await axios.get(`${process.env.API_URL}/delivery/data`, {
            params: {
                destination: JSON.stringify(destinationsArray),
                serviceType
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error calculating delivery data:', error);
        return null;
    }
}
