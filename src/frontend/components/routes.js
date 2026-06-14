import Login from "../pages/login/index.js";
import Register from "../pages/register/index.js";
import Dashboard from "../pages/dashboard/index.js";
import NovaDenuncia from "../pages/denuncias/index.js";
import Quiz from "../pages/quiz/index.js";
import Blacklist from "../pages/blacklist/index.js";
import Forgot from "./forgot.js";

const routes = {
  login: Login,
  register: Register,
  dashboard: Dashboard,
  denuncia: NovaDenuncia,
  quiz: Quiz,
  blacklist: Blacklist,
  forgot: Forgot,
};

export default routes;
