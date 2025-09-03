// // src/api/client.js
// const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8080";

// export function makeClient(getAuthHeader) {
//   async function request(path, options = {}) {
//     const headers = new Headers(options.headers || {});
//     const auth = getAuthHeader?.();
//     if (auth) headers.set("Authorization", auth);
//     if (!headers.has("Content-Type") && options.body) {
//       headers.set("Content-Type", "application/json");
//     }

//     const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
//     if (!res.ok) {
//       const text = await res.text().catch(() => "");
//       throw new Error(`${res.status} ${res.statusText} - ${text}`);
//     }
//     const ct = res.headers.get("content-type") || "";
//     return ct.includes("application/json") ? res.json() : res.text();
//   }

//   return {
//     whoAmI: () => request("/api/auth/whoami"),
//     courses: {
//       list: () => request("/api/courses"),
//       create: (payload) => request("/api/courses", { method: "POST", body: JSON.stringify(payload) }),
//       update: (id, payload) => request(`/api/courses/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
//       remove: (id) => request(`/api/courses/${id}`, { method: "DELETE" }),
//     },
//     registrations: {
//       // listAll (admin/lecturer)
//       listAll: () => request("/api/registrations"),
//       // student creates own registration
//       create: (payload) => request("/api/registrations", { method: "POST", body: JSON.stringify(payload) }),
//       byStudent: (studentId) => request(`/api/registrations/by-student/${studentId}`),
//       transcriptByStudent: (studentId) => request(`/api/registrations/transcript/by-student/${studentId}`),
//       update: (id, payload) => request(`/api/registrations/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
//       remove: (id) => request(`/api/registrations/${id}`, { method: "DELETE" }),
//     },
//     students: {
//       list: () => request("/api/students"),
//       create: (payload) => request("/api/students", { method: "POST", body: JSON.stringify(payload) }),
//     }
//   };
// }

// export { API_BASE };


// src/api/client.js

// Use env var when deployed, fallback to local Docker backend
// src/api/client.js
const API_BASE = import.meta.env.VITE_API_BASE || "";  // "" -> same origin (Vite proxy)


export function makeClient(getAuthHeader) {
  async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const auth = getAuthHeader?.();
    if (auth) headers.set("Authorization", auth);
    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`${res.status} ${res.statusText} - ${text}`);
    }
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
  }

  return {
    // --- Auth ---
    whoAmI: () => request("/api/auth/whoami"),

    // --- Courses ---
    courses: {
      list: () => request("/api/courses"),
      create: (payload) =>
        request("/api/courses", { method: "POST", body: JSON.stringify(payload) }),
      update: (id, payload) =>
        request(`/api/courses/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
      remove: (id) =>
        request(`/api/courses/${id}`, { method: "DELETE" }),
    },

    // --- Registrations ---
    registrations: {
      listAll: () => request("/api/registrations"), // admin/lecturer
      create: (payload) =>
        request("/api/registrations", { method: "POST", body: JSON.stringify(payload) }), // student creates own
      byStudent: (studentId) =>
        request(`/api/registrations/by-student/${studentId}`),
      transcriptByStudent: (studentId) =>
        request(`/api/registrations/transcript/by-student/${studentId}`),
      update: (id, payload) =>
        request(`/api/registrations/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
      remove: (id) =>
        request(`/api/registrations/${id}`, { method: "DELETE" }),
    },

    // --- Students ---
    students: {
      list: () => request("/api/students"),
      create: (payload) =>
        request("/api/students", { method: "POST", body: JSON.stringify(payload) }),
    },
  };
}

// Export for external reference (e.g., debugging)
export { API_BASE };

