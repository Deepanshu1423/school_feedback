import axios from "axios";

const api = axios.create({
  // baseURL: "http://192.168.1.2:5000/api",
  baseURL: "http://localhost:5000/api",
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;