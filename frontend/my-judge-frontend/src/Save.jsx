import { useEffect, useState } from "react";
import axios from "axios";

function Snippets() {
  const [snippets, setSnippets] = useState([]);
  const token = localStorage.getItem("token");

  const fetchSnippets = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/save", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSnippets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/save/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSnippets((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoad = (snippet) => {
    // Save to localStorage so Compiler can pick it up
    localStorage.setItem("loadedCode", snippet.code);
    localStorage.setItem("loadedLanguage", snippet.language);

    window.location.href = "/compile";
  };

  return (
    <div style={styles.container}>
      <h1>My Snippets</h1>

      {snippets.length === 0 ? (
        <p>No snippets saved yet.</p>
      ) : (
        <div style={styles.grid}>
          {snippets.map((snippet) => (
            <div key={snippet._id} style={styles.card}>
              <h3>{snippet.filename}</h3>
              <p>{snippet.language}</p>

              <div style={styles.actions}>
                <button onClick={() => handleLoad(snippet)}>
                  Open
                </button>

                <button
                  onClick={() => handleDelete(snippet._id)}
                  style={{ background: "red", color: "white" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "30px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px"
  },
  card: {
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px"
  },
  actions: {
    marginTop: "10px",
    display: "flex",
    gap: "10px"
  }
};

export default Snippets;