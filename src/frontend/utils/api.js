import { API_URL } from "../config.js";

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}/api/${endpoint}`;
  return fetch(url, options);
}

export async function fetchAuthApi(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  return fetchApi(endpoint, { ...options, headers });
}

export async function fetchJsonAuthApi(endpoint, body, method = "POST") {
  return fetchAuthApi(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
