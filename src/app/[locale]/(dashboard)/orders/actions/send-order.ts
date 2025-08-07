import axios from 'axios';
import toast from 'react-hot-toast';

type SendOrderBody = {
    orderId: string;
    driverPhone: string;
};

export function sendOrder(body: SendOrderBody) {
    try {
        const token = localStorage.getItem('token');
        axios
            .post(`${process.env.API_URL}/send/order`, body, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((_) => {
                toast.success('Order sent successfully');
            })
            .catch((error) => {
                toast.error(`Error sending order: ${error.response?.data?.message}`);
            });
    } catch (error) {
        toast.error('Error sending order');
    }
}
