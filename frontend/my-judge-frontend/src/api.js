import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: "http://localhost:8081/api/auth", // change if your backend runs elsewhere
});

export default API;
