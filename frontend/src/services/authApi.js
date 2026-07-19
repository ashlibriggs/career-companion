const API_BASE_URL = "http://127.0.0.1:5000/api/auth";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

export function signup(userData) {
  return request("/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function login(credentials) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function getCurrentUser() {
  return request("/me");
}

export function logout() {
  return request("/logout", {
    method: "DELETE",
  });
}