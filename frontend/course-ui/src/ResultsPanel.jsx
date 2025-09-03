import { useEffect, useState } from "react";

export default function ResultsPanel() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/students").then(r => r.json()).then(setStudents).catch(() => setErr("Failed to load students"));
  }, []);

  const loadTranscript = async (id) => {
    setErr("");
    setData(null);
    try {
      const res = await fetch(`/api/registrations/transcript/by-student/${id}`);
      setData(await res.json());
    } catch (e) {
      setErr("Failed to load transcript");
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Results / Transcript</h2>
      <div style={{ display: "flex", gap: "0.5rem", margin: "0.5rem 0" }}>
        <select value={studentId} onChange={(e) => { setStudentId(e.target.value); if (e.target.value) loadTranscript(e.target.value); }}>
          <option value="">Select student…</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.regNo} — {s.fullName}</option>)}
        </select>
        <button disabled={!studentId} onClick={() => loadTranscript(studentId)}>Load</button>
      </div>

      {err && <div style={{ color: "red" }}>{err}</div>}

      {data && (
        <div>
          <div style={{ margin: "0.5rem 0" }}>
            <strong>Student:</strong> {data.student?.fullName} ({data.student?.regNo})<br/>
            <strong>Completed:</strong> {data.completedCount} &nbsp;|&nbsp; <strong>GPA:</strong> {data.gpa}
          </div>
          <table border="1" cellPadding="8" width="100%">
            <thead>
              <tr>
                <th>Semester</th>
                <th>Course</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {data.items?.map(it => (
                <tr key={it.registrationId}>
                  <td>{it.semester}</td>
                  <td>{it.course.code} — {it.course.title}</td>
                  <td>{it.score ?? ""}</td>
                  <td>{it.grade ?? ""}</td>
                  <td>{it.points ?? ""}</td>
                </tr>
              ))}
              {(!data.items || data.items.length === 0) && (
                <tr><td colSpan="5" style={{ textAlign: "center" }}>No completed results yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
