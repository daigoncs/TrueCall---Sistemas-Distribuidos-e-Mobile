export default () => {
  const container = document.createElement("div");

  container.innerHTML = `
  
    <form class="container">

        <div class="form-switch">
        <a href="#login">Entrar</a>
        <a href="#register" class="active">Criar conta</a>
      </div>

      <h2>Criar Conta</h2>

      <input
        type="text"
        id="nome"
        class="input Nome"
        placeholder="Nome"
      >

      <input
        type="email"
        id="email"
        class="input Email"
        placeholder="Email"
      >

      <input
        type="password"
        id="senha"
        class="input Senha"
        placeholder="Senha"
      >

      <button id="btnCadastrar"
      class="btn cadastrar">
        Cadastrar
      </button>

      <p id="message" class="message"></p>

    </form>
  `;

  const btn = container.querySelector("#btnCadastrar");
  const msg = container.querySelector("#message");

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    msg.className = "message";
    msg.innerHTML = "";

    const nome = container.querySelector("#nome").value.trim();
    const email = container.querySelector("#email").value.trim();
    const senha = container.querySelector("#senha").value;

    if (!nome || !email || !senha) {
      msg.className = "message errorMessage";
      msg.innerHTML = "Por favor, preencha todos os campos.";
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      msg.className = "message errorMessage";
      msg.innerHTML = "Formato de email inválido.";
      return;
    }

    if (senha.length < 6) {
      msg.className = "message errorMessage";
      msg.innerHTML = "A senha deve ter no mínimo 6 caracteres.";
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro);
      }

      msg.className = "message successMessage";
      msg.innerHTML = "Cadastro realizado com sucesso!";

      setTimeout(() => {
        window.location.hash = "#login";
      }, 1500);
    } catch (error) {
      msg.className = "message errorMessage";
      msg.innerHTML = error.message;
    }
  });

  return container;
};
