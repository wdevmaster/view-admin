import { apiClient } from '@/service/client';

const API_URL = import.meta.env.VITE_KITCHEN_BASE_URL;
const client = apiClient(API_URL);

export const getOrdersData = async () => {
    return await client.get('/api/orders');
};

export const showOrderData = async (_uuid) => {
    return await client.get(`/api/order/${_uuid}`);
};

export const getDishesData = async () => {
    return await client.get('/api/dishes');
};

export const generateOrder = async (__dishes = 1) => {
    return await client.post('/api/order/store', { number_dishes: __dishes });
};
