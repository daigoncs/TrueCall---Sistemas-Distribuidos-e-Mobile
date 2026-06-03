export default () => {
  const containerLogin = document.createElement("div");

  const templateLogin = `
    <form class="container">

        <div class="form-switch">
      <a href="#login" class="active">Entrar</a>
      <a href="#register">Criar conta</a>
    </div>

      <h2> Entre na sua conta </h2>

      <input
        type="email"
        class="input Email"
        id="inputEmail"
        placeholder="Insira seu Email"
      />

      <br>

      <input
        type="password"
        class="input Senha"
        id="inputSenha"
        placeholder="Insira sua senha"
      />

      <br>

          <a href="#forgot" class="forgot-link">Esqueci minha senha</a>

      <p id="message" class="successMessage menssage"></p>

      <br>

      <button
        class="btn entrar"
        id="btn-Entrar"
      >
        Entrar
      </button>

    <p class="bottom-link">
      Não tem conta? <a href="#register">Cadastre-se grátis</a>
    </p>

    </form>
  `;

  containerLogin.innerHTML = templateLogin;

  const loginEmail = containerLogin.querySelector("#inputEmail");

  const loginSenha = containerLogin.querySelector("#inputSenha");

  const btnEntrar = containerLogin.querySelector("#btn-Entrar");

  const msgAlert = containerLogin.querySelector("#message");

  btnEntrar.addEventListener("click", async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail.value,
          senha: loginSenha.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro);
      }

      localStorage.setItem("token", data.token);

      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      window.location.hash = "#dashboard";
    } catch (error) {
      msgAlert.innerHTML = error.message;
    }
  });

  return containerLogin;
};
