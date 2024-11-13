import { apiClient } from '@/service/client';

const API_URL = import.meta.env.VITE_WAREHOUSE_BASE_URL;
const client = apiClient(API_URL);

export const getIngredientsData = async () => {
    return await client.get('/api/ingredients');
};

export const getPurchaseHistoryData = async () => {
    return await client.get('/api/purchase/history');
};
