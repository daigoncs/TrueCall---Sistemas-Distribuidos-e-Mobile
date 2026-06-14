import Login from "../pages/login/index.js";
import Register from "../pages/register/index.js";
import Dashboard from "../pages/dashboard/index.js";
import NovaDenuncia from "../pages/denuncias/index.js";
import Quiz from "../pages/quiz/index.js";
import Blacklist from "../pages/blacklist/index.js";
import Forgot from "./forgot.js";

const PRIVATE_ROUTES = ["#dashboard", "#denuncia", "#blacklist"];

const routes = {
  login: Login,
  register: Register,
  dashboard: Dashboard,
  denuncia: NovaDenuncia,
  quiz: Quiz,
  blacklist: Blacklist,
  forgot: Forgot,
};

export function navigateTo(hash) {
  const token = localStorage.getItem("token");

  if (PRIVATE_ROUTES.includes(hash) && !token) {
    window.location.hash = "#login";
    return routes.login;
  }

  if ((hash === "#login" || hash === "#register") && token) {
    window.location.hash = "#dashboard";
    return routes.dashboard;
  }

  const routeName = hash.replace("#", "") || "login";
  return routes[routeName] || routes.login;
}

export default routes;
