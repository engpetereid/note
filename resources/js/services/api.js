import axios from 'axios';

// Create an Axios instance configured for Laravel Sanctum SPA Authentication
const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    // Crucial for Sanctum cookies to be sent with every request
    withCredentials: true,
});

// Helper to fetch CSRF cookie before making POST/PUT requests (Sanctum requirement)
export const initCsrf = () => axios.get('/sanctum/csrf-cookie');

// --- Dashboard Endpoints ---
export const fetchDashboardData = (date) => {
    return apiClient.get(`/dashboard?date=${date}`);
};

export const toggleActivity = (activity_id, date) => {
    return apiClient.post('/tracking/toggle', { activity_id, date });
};

// --- System Builder (Onboarding) Endpoints ---
export const fetchAllActivities = () => {
    return apiClient.get('/activities');
};

export const fetchMyRoutine = () => {
    return apiClient.get('/routines');
};

export const saveMyRoutine = (activity_ids) => {
    return apiClient.post('/routines', { activity_ids });
};

// --- Profile & Firebase ---
export const saveFcmToken = (fcm_token) => {
    return apiClient.post('/profile/fcm-token', { fcm_token });
};
