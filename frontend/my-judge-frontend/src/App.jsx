import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Compiler from "./Compiler";
import Login from "./Login";
import Register from "./Register";

function App() {
  return (
    <Router>

      <Routes>

        <Route path="/compile" element={<Compiler />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

      </Routes>

    </Router>
  );
}

export default App;