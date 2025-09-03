import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// add Authorization header automatically from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default api;
