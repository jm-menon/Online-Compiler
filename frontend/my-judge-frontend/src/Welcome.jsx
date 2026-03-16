import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";

function Welcome() {

    const token = localStorage.getItem("token");

    if (token) {
      return <Navigate to="/compile" />;
    }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to Online Compiler</h1>

        <p style={styles.subtitle}>
          Write, run, and debug code directly from your browser.
        </p>

        <div style={styles.buttons}>
          <Link to="/login" style={styles.link}>
            <button style={styles.button}>Login</button>
          </Link>

          <Link to="/register" style={styles.link}>
            <button style={styles.button}>Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
    fontFamily: "Arial, sans-serif"
  },
  card: {
    padding: "40px",
    borderRadius: "10px",
    background: "white",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: "400px"
  },
  title: {
    marginBottom: "10px"
  },
  subtitle: {
    color: "#555",
    marginBottom: "30px"
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "15px"
  },
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontSize: "14px"
  },
  link: {
    textDecoration: "none"
  }
};

export default Welcome;