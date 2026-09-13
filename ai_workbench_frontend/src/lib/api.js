const API_BASE_URL = "http://127.0.0.1:8000";

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (data.status === "error") {
    throw new Error(data.message);
  }

  return data;
}