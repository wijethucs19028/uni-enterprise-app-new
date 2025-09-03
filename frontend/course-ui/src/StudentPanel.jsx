import { useEffect, useState } from "react";

export default function StudentPanel() {
  const [students, setStudents] = useState([]);
  const [regNo, setRegNo] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadStudents = async () => {
    try {
      setBusy(true);
      setError("");
      const res = await fetch("/api/students");
      if (!res.ok) throw new Error(await res.text());
      setStudents(await res.json());
    } catch (e) {
      setError("Failed to load students");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const clearForm = () => {
    setRegNo(""); setFullName(""); setEmail("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!regNo.trim() || !fullName.trim() || !email.trim()) {
      setError("All fields required");
      return;
    }
    // quick email sanity check (frontend only)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email");
      return;
    }
    try {
      setBusy(true);
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regNo: regNo.trim(), fullName: fullName.trim(), email: email.trim() }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Create failed");
      }
      clearForm();
      await loadStudents();
    } catch (e) {
      setError("Create failed. " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const updateStudent = async (s) => {
    const newName = prompt("New full name:", s.fullName);
    if (newName === null) return;
    const newEmail = prompt("New email:", s.email);
    if (newEmail === null) return;

    try {
      setBusy(true);
      const res = await fetch(`/api/students/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regNo: s.regNo, fullName: newName.trim(), email: newEmail.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      await loadStudents();
    } catch (e) {
      setError("Update failed. " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const removeStudent = async (s) => {
    if (!confirm(`Delete student ${s.regNo}?`)) return;
    try {
      setBusy(true);
      const res = await fetch(`/api/students/${s.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      await loadStudents();
    } catch (e) {
      setError("Delete failed. " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const filtered = students.filter(st =>
    (st.regNo + " " + st.fullName + " " + st.email).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Students</h2>

      <form onSubmit={handleSubmit} className="hstack" style={{ margin: "0.5rem 0", flexWrap: "wrap" }}>
        <input
          placeholder="Reg No (IT2025-001)"
          value={regNo}
          onChange={e => setRegNo(e.target.value)}
        />
        <input
          placeholder="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          style={{ minWidth: 220 }}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ minWidth: 220 }}
        />
        <button className="primary" type="submit" disabled={busy}>Add</button>
        <button type="button" onClick={clearForm} disabled={busy}>Clear</button>
      </form>

      <div className="hstack" style={{ margin: "8px 0" }}>
        <input
          placeholder="Search students (reg no / name / email)…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={loadStudents} disabled={busy}>Refresh</button>
      </div>

      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}

      {busy ? (
        <div>Loading…</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Reg No</th>
              <th>Full Name</th>
              <th>Email</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.regNo}</td>
                <td>{s.fullName}</td>
                <td>{s.email}</td>
                <td>
                  <button onClick={() => updateStudent(s)} disabled={busy}>Edit</button>
                  <button
                    onClick={() => removeStudent(s)}
                    className="danger"
                    style={{ marginLeft: 8 }}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: "center" }}>No results.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
