/*import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const API = axios.create({
  //baseURL: "http://localhost:8081/api/auth", // change if your backend runs elsewhere
  baseURL: "https://my-online-compiler-backend.onrender.com",
});

export default API;*/

import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export default API;
