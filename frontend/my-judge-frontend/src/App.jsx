import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Compiler from "./Compiler";
import Login from "./Login";
import Register from "./Register";
import Welcome from "./Welcome";

function App() {
  return (
    <Router>

      <Routes>

        <Route path="/" element={<Welcome />} />

        <Route path="/compile" element={<Compiler />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

      </Routes>

    </Router>
  );
}

export default App;