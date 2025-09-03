import { useEffect, useState } from "react";

export default function RegistrationPanel() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [semester, setSemester] = useState("2025S1");
  const [error, setError] = useState("");

  const loadAll = async () => {
    try {
      const [sRes, cRes, rRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/courses"),
        fetch("/api/registrations"),
      ]);
      setStudents(await sRes.json());
      setCourses(await cRes.json());
      setRegistrations(await rRes.json());
    } catch (e) {
      setError("Failed to load data");
    }
  };

  useEffect(() => { loadAll(); }, []);

  const createRegistration = async (e) => {
    e.preventDefault();
    setError("");
    if (!studentId || !courseId || !semester.trim()) {
      setError("Select student, course, and semester.");
      return;
    }
    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: Number(studentId),
        courseId: Number(courseId),
        semester,
        status: "REGISTERED",
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      setError(text || "Create failed (duplicate?)");
      return;
    }
    setStudentId("");
    setCourseId("");
    setSemester("2025S1");
    await loadAll();
  };

  const updateResult = async (reg) => {
    const scoreStr = prompt("Score (0-100)", reg.score ?? "");
    if (scoreStr === null) return;
    const score = scoreStr === "" ? null : Number(scoreStr);
    const grade = prompt("Grade (e.g., A, B+)", reg.grade ?? "");
    const status = confirm("Mark as COMPLETED?") ? "COMPLETED" : reg.status;

    await fetch(`/api/registrations/${reg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, grade, status }),
    });
    await loadAll();
  };

  const remove = async (reg) => {
    if (!confirm(`Delete registration of ${reg.student.fullName} for ${reg.course.code}?`)) return;
    await fetch(`/api/registrations/${reg.id}`, { method: "DELETE" });
    await loadAll();
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Registrations</h2>

      <form onSubmit={createRegistration} style={{ display: "flex", gap: "0.5rem", margin: "0.5rem 0" }}>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          <option value="">Select student…</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.regNo} — {s.fullName}</option>)}
        </select>

        <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">Select course…</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
        </select>

        <input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="Semester (e.g., 2025S1)" />

        <button type="submit">Register</button>
      </form>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <table border="1" cellPadding="8" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Student</th>
            <th>Course</th>
            <th>Semester</th>
            <th>Status</th>
            <th>Score</th>
            <th>Grade</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.student.fullName} ({r.student.regNo})</td>
              <td>{r.course.code}</td>
              <td>{r.semester}</td>
              <td>{r.status}</td>
              <td>{r.score ?? ""}</td>
              <td>{r.grade ?? ""}</td>
              <td>
                <button onClick={() => updateResult(r)}>Update</button>
                <button onClick={() => remove(r)} style={{ marginLeft: "0.5rem", color: "red" }}>Delete</button>
              </td>
            </tr>
          ))}
          {registrations.length === 0 && (
            <tr><td colSpan="8" style={{ textAlign: "center" }}>No registrations yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
