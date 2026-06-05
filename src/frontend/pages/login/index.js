export default () => {
  const containerLogin = document.createElement("div");

  const templateLogin = `
    <div class="login-page-container">
      
      <form class="container login-box">

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

        <p id="message" class="message"></p>

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

      <!-- Consulta Rapida Publica -->
      <div class="container consulta-box">
        <h2>Consulta Rápida</h2>
        <p class="consulta-subtitulo">Verifique se um número de telefone é seguro antes de atender ou responder.</p>
        
        <input
          type="tel"
          id="inputConsultaTelefone"
          class="input"
          placeholder="Digite o número suspeito"
        />
        
        <div id="resultadoConsulta" class="resultado-consulta" style="display: none;"></div>

        <button id="btnConsultar" class="btn entrar">
          Verificar Número
        </button>
      </div>

    </div>
  `;

  containerLogin.innerHTML = templateLogin;

  const loginEmail = containerLogin.querySelector("#inputEmail");
  const loginSenha = containerLogin.querySelector("#inputSenha");
  const btnEntrar = containerLogin.querySelector("#btn-Entrar");
  const msgAlert = containerLogin.querySelector("#message");

  // Lógica do Login
  btnEntrar.addEventListener("click", async (e) => {
    e.preventDefault();
    msgAlert.className = "message";
    msgAlert.innerHTML = "";

    const email = loginEmail.value.trim();
    const senha = loginSenha.value.trim();

    if (!email || !senha) {
      msgAlert.className = "message errorMessage";
      msgAlert.innerHTML = "Por favor, preencha todos os campos.";
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro);
      }

      msgAlert.className = "message successMessage";
      msgAlert.innerHTML = "Login realizado com sucesso!";

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      setTimeout(() => {
        window.location.hash = "#dashboard";
      }, 800);
    } catch (error) {
      msgAlert.className = "message errorMessage";
      msgAlert.innerHTML = error.message;
    }
  });

  // Lógica da Consulta Rápida
  const inputConsulta = containerLogin.querySelector("#inputConsultaTelefone");
  const btnConsultar = containerLogin.querySelector("#btnConsultar");
  const resultadoConsulta = containerLogin.querySelector("#resultadoConsulta");

  // Mascara automatica para o telefone de consulta (adaptativa)
  inputConsulta.addEventListener("input", (e) => {
    let valor = e.target.value.replace(/\D/g, "");

    if (valor.startsWith("0800")) {
      if (valor.length > 11) valor = valor.slice(0, 11);
      if (valor.length <= 4) {
        e.target.value = valor;
      } else if (valor.length <= 7) {
        e.target.value = `${valor.slice(0, 4)} ${valor.slice(4)}`;
      } else {
        e.target.value = `${valor.slice(0, 4)} ${valor.slice(4, 7)} ${valor.slice(7)}`;
      }
    } else if (valor.startsWith("4004") || valor.startsWith("3003")) {
      if (valor.length > 8) valor = valor.slice(0, 8);
      if (valor.length <= 4) {
        e.target.value = valor;
      } else {
        e.target.value = `${valor.slice(0, 4)}-${valor.slice(4)}`;
      }
    } else {
      if (valor.length > 11) valor = valor.slice(0, 11);
      if (valor.length === 0) {
        e.target.value = "";
      } else if (valor.length <= 2) {
        e.target.value = `(${valor}`;
      } else if (valor.length <= 6) {
        e.target.value = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
      } else if (valor.length <= 10) {
        e.target.value = `(${valor.slice(0, 2)}) ${valor.slice(2, 6)}-${valor.slice(6)}`;
      } else {
        e.target.value = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
      }
    }
  });

  btnConsultar.addEventListener("click", async (e) => {
    e.preventDefault();
    resultadoConsulta.style.display = "none";
    resultadoConsulta.className = "resultado-consulta";
    resultadoConsulta.innerHTML = "";

    const telefoneVal = inputConsulta.value;
    const telefoneLimpo = telefoneVal.replace(/\D/g, "");

    if (telefoneLimpo.length !== 8 && telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) {
      resultadoConsulta.style.display = "block";
      resultadoConsulta.classList.add("erro");
      resultadoConsulta.innerHTML = "Por favor, digite um número válido (celular, fixo, 0800 ou 4004).";
      return;
    }

    try {
      btnConsultar.disabled = true;
      btnConsultar.innerText = "Verificando...";

      const response = await fetch(`http://localhost:5000/api/denuncias/publico/verificar/${telefoneLimpo}`);
      const data = await response.json();

      resultadoConsulta.style.display = "block";
      
      if (data.status === "confiavel") {
        resultadoConsulta.classList.add("confiavel");
        resultadoConsulta.innerHTML = `<strong>Número Oficial</strong><br>${data.detalhes}`;
      } else if (data.status === "suspeito") {
        resultadoConsulta.classList.add("suspeito");
        resultadoConsulta.innerHTML = `<strong>Aviso de Golpe</strong><br>${data.detalhes}`;
      } else {
        resultadoConsulta.classList.add("desconhecido");
        resultadoConsulta.innerHTML = `<strong>Não Registrado</strong><br>${data.detalhes}`;
      }

    } catch (err) {
      console.error(err);
      resultadoConsulta.style.display = "block";
      resultadoConsulta.classList.add("erro");
      resultadoConsulta.innerHTML = "Erro ao conectar ao servidor. Tente novamente.";
    } finally {
      btnConsultar.disabled = false;
      btnConsultar.innerText = "Verificar Número";
    }
  });

  return containerLogin;
};
