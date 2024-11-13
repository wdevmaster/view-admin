import axios from 'axios';

class ApiClient {
    constructor(baseUrl, contentType = 'application/json') {
        // El API_URL ahora se pasa como parámetro, sin necesidad de obtenerlo del entorno
        this.baseUrl = baseUrl;
        this.contentType = contentType;
        this.headers = {
            'Cache-Control': 'no-cache',
            expires: '0',
            'Content-Type': contentType,
            Accept: contentType === 'application/json' ? 'application/json' : '*/*'
        };

        // Crear instancia de Axios con configuración base
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: this.headers
        });
    }

    // Métodos de solicitudes HTTP
    async get(endpoint, config) {
        return this.request(endpoint, 'GET', config);
    }

    async post(endpoint, data, config) {
        return this.request(endpoint, 'POST', {
            ...config,
            data
        });
    }

    async put(endpoint, data, config) {
        return this.request(endpoint, 'PUT', {
            ...config,
            data
        });
    }

    async delete(endpoint, config) {
        return this.request(endpoint, 'DELETE', config);
    }

    // Método para hacer la solicitud real
    async request(endpoint, method, config = {}) {
        try {
            // Realiza la solicitud utilizando Axios sin el parámetro 'locale'
            const response = await this.client({
                url: endpoint,
                method: method,
                ...config // Se aplica cualquier otra configuración proporcionada
            });

            if (response.status !== 204) {
                return response.data;
            }
            return {}; // No content
        } catch (error) {
            if (error.response) {
                const { response } = error;
                // Manejo de diferentes códigos de estado HTTP
                if (response.status === 422 || response.status === 404 || response.status === 401 || response.status === 500 || response.status === 504) {
                    return { ...response.data, status: response.status };
                }
            }
            throw error;
        }
    }
}

export const apiClient = (baseUrl) => new ApiClient(baseUrl);
