import { navigateTo } from "./components/routes.js";

function renderPage() {
  const currentHash = window.location.hash || "#login";

  const pageComponent = navigateTo(currentHash);

  let root = document.getElementById("root") || document.getElementById("app");

  if (!root) {
    root = document.body;
  }

  root.innerHTML = "";
  root.appendChild(pageComponent());
}

window.addEventListener("hashchange", renderPage);
window.addEventListener("load", renderPage);
