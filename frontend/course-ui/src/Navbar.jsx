export default function Navbar({ current, onChange }) {
  const tabs = [
    { id: "courses", label: "Courses" },
    { id: "registrations", label: "Registrations" },
    { id: "students", label: "Students" },
    { id: "results", label: "Results" },
  ];

  return (
    <div style={{
      display: "flex", gap: 8, padding: "12px 16px",
      borderBottom: "1px solid #e6e8ef", background: "#fff", position: "sticky", top: 0, zIndex: 10
    }}>
      <div style={{ fontWeight: 700, marginRight: 16 }}>U-CMS</div>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: "8px 12px", borderRadius: 8, border: "1px solid #d6d8df",
            background: current === t.id ? "#2563eb" : "#fff",
            color: current === t.id ? "#fff" : "#222",
            cursor: "pointer"
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
