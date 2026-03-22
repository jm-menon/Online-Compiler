import { useEffect, useState } from "react";
import axios from "axios";

function Save() {
  const [savedFiles, setSavedFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ filename: "", language: "", code: "" });
  const token = localStorage.getItem("token");
  const [searchQuery, setSearchQuery] = useState("");

const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim() === "") {
        fetchSavedFiles(); // reset to full list when search is cleared
        return;
    }

    try {
        const res = await axios.get(`http://localhost:8080/api/save/search?query=${value}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setSavedFiles(res.data);
    } catch (err) {
        console.error(err);
    }
};

  const fetchSavedFiles = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/save", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSavedFiles();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/save/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedFiles((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoad = (savedFile) => {
    localStorage.setItem("loadedCode", savedFile.code);
    localStorage.setItem("loadedLanguage", savedFile.language);
    window.location.href = "/compile";
  };

  const startEdit = (savedFile) => {
    setEditingId(savedFile._id);
    setEditForm({
      filename: savedFile.filename,
      language: savedFile.language,
      code: savedFile.code
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ filename: "", language: "", code: "" });
  };

  const handleEdit = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/save/${id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedFiles((prev) => prev.map((f) => f._id === id ? response.data : f));
      setEditingId(null);
      setEditForm({ filename: "", language: "", code: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <h1>My Saved Files</h1>
        <input
          style={styles.searchBar}
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by filename..."
        />
      {savedFiles.length === 0 ? (
        <p>No files saved yet.</p>
      ) : (
        <div style={styles.grid}>
          {savedFiles.map((savedFile) => (
            <div key={savedFile._id} style={styles.card}>

              {editingId === savedFile._id ? (
                // edit mode
                <>
                  <input
                    style={styles.input}
                    value={editForm.filename}
                    onChange={(e) => setEditForm({ ...editForm, filename: e.target.value })}
                    placeholder="Filename"
                  />
                  <input
                    style={styles.input}
                    value={editForm.language}
                    onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                    placeholder="Language"
                  />
                  <textarea
                    style={styles.textarea}
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                    placeholder="Code"
                  />
                  <div style={styles.actions}>
                    <button onClick={() => handleEdit(savedFile._id)}>
                      Save
                    </button>
                    <button onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                // view mode
                <>
                  <h3>{savedFile.filename}</h3>
                  <p>{savedFile.language}</p>
                  <div style={styles.actions}>
                    <button onClick={() => handleLoad(savedFile)}>
                      Open
                    </button>
                    <button onClick={() => startEdit(savedFile)}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(savedFile._id)}
                      style={{ background: "red", color: "white" }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "30px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px"
  },
  card: { padding: "15px", border: "1px solid #ddd", borderRadius: "8px" },
  actions: { marginTop: "10px", display: "flex", gap: "10px" },
  input: { display: "block", width: "100%", marginBottom: "8px", padding: "6px" },
  textarea: { display: "block", width: "100%", height: "100px", marginBottom: "8px", padding: "6px" }
};

export default Save;