export function requireAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.hash = "#login";
    return null;
  }
  return token;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.hash = "#login";
}
