// API Client service for communicating with Flask Backend
const API_BASE_URL = "http://localhost:5000/api";

const ApiService = {
    
    async fetchWithHandler(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            throw error; 
        }
    },

    
    async searchHotels(params) {
        const query = new URLSearchParams(params).toString();
        return this.fetchWithHandler(`/hotels/search?${query}`);
    },

    async getLocations(keyword) {
        return this.fetchWithHandler(`/locations/autocomplete?q=${keyword}`);
    }
};

// Edit: Document API error handling logic