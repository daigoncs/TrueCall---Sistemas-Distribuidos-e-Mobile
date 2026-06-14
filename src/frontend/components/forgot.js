export default () => {
  const containerForgot = document.createElement("div");

  const templateForgot = `
    <div class="login-page-container">
      
      <div class="container dynamic-box">
        <h2>Recuperar Senha</h2>
        <p class="consulta-subtitulo">
          Insira o seu e-mail cadastrado para receber as instruções de redefinição de senha.
        </p>

        <form id="form-forgot">
          <input
            type="email"
            class="input Email"
            id="forgotEmail"
            placeholder="Digite seu e-mail"
            required
          />

          <p id="forgot-message" class="message"></p>

          <br>

          <button class="btn entrar" id="btn-enviar-recovery">
            Enviar E-mail de Recuperação
          </button>
        </form>

        <p class="bottom-link" style="margin-top: 20px;">
          Lembrou a senha? <a href="#login">Voltar para o Login</a>
        </p>
      </div>

    </div>
  `;

  containerForgot.innerHTML = templateForgot;

  const forgotEmail = containerForgot.querySelector("#forgotEmail");
  const btnEnviar = containerForgot.querySelector("#btn-enviar-recovery");
  const msgAlert = containerForgot.querySelector("#forgot-message");
  const formForgot = containerForgot.querySelector("#form-forgot");

  formForgot.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    msgAlert.className = "message";
    msgAlert.innerHTML = "";

    const email = forgotEmail.value.trim();

    try {
      btnEnviar.disabled = true;
      btnEnviar.innerText = "Enviando...";

      // Requisição para a sua API do Backend
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao processar a solicitação.");
      }

      msgAlert.className = "message successMessage";
      msgAlert.innerHTML = "E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.";
      forgotEmail.value = ""; // Limpa o campo após o sucesso

    } catch (error) {
      msgAlert.className = "message errorMessage";
      msgAlert.innerHTML = error.message;
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.innerText = "Enviar E-mail de Recuperação";
    }
  });

  return containerForgot;
};