// src/api/axios.ts
import axios from "axios";

export const api_authentication = axios.create({
  baseURL: import.meta.env.VITE_API_AUTH_URL,
  timeout: 10000,
});
