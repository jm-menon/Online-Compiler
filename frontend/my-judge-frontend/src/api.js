import axios from "axios";

console.log("NEW API FILE LOADED");

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export default API;