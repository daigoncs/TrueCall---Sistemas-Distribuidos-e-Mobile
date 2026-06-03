import routes from "./routes.js";

const app = document.getElementById("app");

function render() {
  const route = window.location.hash.replace("#", "") || "login";

  app.innerHTML = "";

  if (routes[route]) {
    app.appendChild(routes[route]());
  }
}

window.addEventListener("hashchange", render);
window.addEventListener("load", render);
