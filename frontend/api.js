import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'https://stu-24feef-clinic-appointment-and-3n66.onrender.com',
});

export default API;