import { useState } from "react";
import API from "./api";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';   



function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();

  try {

    const res = await API.post("/login", {
      username,
      password
    });

    localStorage.setItem("token", res.data.token);

    navigate("/compile");   // redirect to compiler

  } catch (err) {

    setMessage(err.response?.data?.error || "Error occurred");

  }
};

  return (
    <div>

      <h2>Login</h2>

      <form onSubmit={handleLogin}>

        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />

        <br/>

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <br/>

        <button type="submit">Login</button>
        <p>
            Don't have an account? <Link to="/register">Register</Link>
        </p>

      </form>

      <p>{message}</p>
      

    </div>
  );
}

export default Login;