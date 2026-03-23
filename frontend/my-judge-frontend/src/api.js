import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081/api/auth", // change if your backend runs elsewhere
});

export default API;