export default () => {
  const containerLogin = document.createElement("div");

  const templateLogin = `
    <div class="login-page-container">
      
      <div class="container dynamic-box">

        <div class="form-switch">
          <button id="tab-entrar" class="tab-btn active">Entrar</button>
          <button id="tab-consulta" class="tab-btn">Consulta Rápida</button>
        </div>

        <form class="login-box-content" id="box-login">
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

          <button class="btn entrar" id="btn-Entrar">
            Entrar
          </button>

          <p class="bottom-link">
            Não tem conta? <a href="#register">Cadastre-se grátis</a>
          </p>
        </form>

        <div class="consulta-box-content" id="box-consulta" style="display: none;">
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

    </div>
  `;

  containerLogin.innerHTML = templateLogin;

  const tabEntrar = containerLogin.querySelector("#tab-entrar");
  const tabConsulta = containerLogin.querySelector("#tab-consulta");
  const boxLogin = containerLogin.querySelector("#box-login");
  const boxConsulta = containerLogin.querySelector("#box-consulta");

  // Função para alternar as abas
  tabEntrar.addEventListener("click", () => {
    tabEntrar.classList.add("active");
    tabConsulta.classList.remove("active");
    boxLogin.style.display = "block";
    boxConsulta.style.display = "none";
  });

  tabConsulta.addEventListener("click", () => {
    tabConsulta.classList.add("active");
    tabEntrar.classList.remove("active"); 
    boxLogin.style.display = "none";
    boxConsulta.style.display = "block";
  });

  const loginEmail = containerLogin.querySelector("#inputEmail");
  const loginSenha = containerLogin.querySelector("#inputSenha");
  const btnEntrar = containerLogin.querySelector("#btn-Entrar");
  const msgAlert = containerLogin.querySelector("#message");

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
      const response = await fetch("/api/auth/login", {
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

      // Salva os dados de autenticação no cache do navegador
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      // Vai direto para o painel de controle (dashboard) sem delay e sem exibir mensagens de sucesso
      window.location.hash = "#dashboard";

    } catch (error) {
      msgAlert.className = "message errorMessage";
      msgAlert.innerHTML = error.message;
    }
  });

  // Lógica da Consulta Rápida
  const inputConsulta = containerLogin.querySelector("#inputConsultaTelefone");
  const btnConsultar = containerLogin.querySelector("#btnConsultar");
  const resultadoConsulta = containerLogin.querySelector("#resultadoConsulta");

  // Máscara automática para o telefone de consulta
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
      const ehCelular = valor.length >= 3 && valor[2] === "9";
      const limite = ehCelular ? 11 : 10;
      if (valor.length > limite) valor = valor.slice(0, limite);

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

  function obterDicasDefesa(tipos) {
    const recomendacoes = [];
    const mapDicas = {
      "Falsa Central Bancária": [
        "Desligue imediatamente. Bancos nunca ligam solicitando transferências, digitação de senhas ou códigos de segurança por telefone.",
        "Use outro aparelho telefônico para ligar para o canal oficial de atendimento do seu banco (o número no verso do seu cartão) para confirmar qualquer transação suspeita."
      ],
      "PIX Fraudulento": [
        "Não realize transferências urgentes baseadas em pedidos por mensagens, mesmo que pareça ser um conhecido. Confirme a identidade por ligação de voz antes.",
        "Em caso de fraude PIX, entre em contato imediatamente com seu banco para solicitar o MED (Mecanismo Especial de Devolução) em até 80 dias."
      ],
      "Cartão Clonado": [
        "Se suspeitar de clonagem, bloqueie imediatamente o cartão físico pelo aplicativo oficial do seu banco.",
        "Lembre-se: os bancos nunca enviam motoboys ou representantes para recolher cartões físicos em sua residência."
      ],
      "Empréstimo Falso": [
        "Desconfie de ofertas de empréstimos facilitados que exigem pagamentos adiantados a pretexto de taxas de cartório, fiador ou seguros.",
        "Consulte no site do Banco Central se a instituição financeira de fato possui autorização para operar crédito."
      ]
    };

    let ativouDica = false;
    (tipos || []).forEach(tipo => {
      const tipoLower = tipo.toLowerCase();
      if (tipoLower.includes("central") || tipoLower.includes("banco") || tipoLower.includes("bancária") || tipoLower.includes("bancaria") || tipoLower.includes("ligação") || tipoLower.includes("ligacao")) {
        recomendacoes.push(...mapDicas["Falsa Central Bancária"]);
        ativouDica = true;
      }
      if (tipoLower.includes("pix") || tipoLower.includes("transferência") || tipoLower.includes("transferencia") || tipoLower.includes("pagamento")) {
        recomendacoes.push(...mapDicas["PIX Fraudulento"]);
        ativouDica = true;
      }
      if (tipoLower.includes("cartão") || tipoLower.includes("cartao") || tipoLower.includes("clonado") || tipoLower.includes("motoboy")) {
        recomendacoes.push(...mapDicas["Cartão Clonado"]);
        ativouDica = true;
      }
      if (tipoLower.includes("empréstimo") || tipoLower.includes("emprestimo") || tipoLower.includes("crédito") || tipoLower.includes("credito") || tipoLower.includes("financiamento")) {
        recomendacoes.push(...mapDicas["Empréstimo Falso"]);
        ativouDica = true;
      }
    });

    if (!ativouDica) {
      recomendacoes.push(
        "Nunca compartilhe códigos de autenticação (como SMS ou tokens) com terceiros.",
        "Desconfie de mensagens urgentes que contenham links externos para atualização cadastral."
      );
    }

    const dicasUnicas = [...new Set(recomendacoes)];

    return `
      <div class="defesa-contextual" style="margin-top: 12px; padding: 10px 12px; background-color: #ffffff; border: 1.5px solid #fecaca; border-left: 4px solid #991b1b; border-radius: 6px; text-align: left;">
        <div style="font-weight: bold; color: #991b1b; font-size: 0.8rem; margin-bottom: 6px; font-family: 'Sora', sans-serif;">
          Guia de Defesa Recomendado
        </div>
        <ul style="margin: 0; padding-left: 16px; font-size: 0.775rem; color: #7f1d1d; line-height: 1.4;">
          ${dicasUnicas.map(dica => `<li style="margin-bottom: 4px;">${dica}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  btnConsultar.addEventListener("click", async (e) => {
    e.preventDefault();
    resultadoConsulta.style.display = "none";
    resultadoConsulta.className = "resultado-consulta";
    resultadoConsulta.innerHTML = "";

    const telefoneVal = inputConsulta.value;
    const telefoneLimpo = telefoneVal.replace(/\D/g, "");

    const ehCelular = telefoneLimpo.length >= 3 && telefoneLimpo[2] === "9";
    const tamanhoValido = (
      telefoneLimpo.length === 8    ||   
      telefoneLimpo.length === 11 && telefoneLimpo.startsWith("0800") || 
      (ehCelular ? telefoneLimpo.length === 11 : telefoneLimpo.length === 10)
    );

    if (!tamanhoValido) {
      resultadoConsulta.style.display = "block";
      resultadoConsulta.classList.add("erro");
      resultadoConsulta.innerHTML = "Por favor, digite um número válido.";
      return;
    }

    try {
      btnConsultar.disabled = true;
      btnConsultar.innerText = "Verificando...";

      const response = await fetch(`/api/denuncias/publico/verificar/${telefoneLimpo}`);
      const data = await response.json();

      resultadoConsulta.style.display = "block";
      
      if (data.status === "confiavel") {
        resultadoConsulta.classList.add("confiavel");
        resultadoConsulta.innerHTML = `<strong>Número Oficial</strong><br>${data.detalhes}`;
      } else if (data.status === "suspeito") {
        resultadoConsulta.classList.add("suspeito");
        const dicasHtml = obterDicasDefesa(data.tipos_golpe);
        resultadoConsulta.innerHTML = `
          <strong>Aviso de Golpe</strong><br>
          ${data.detalhes}
          ${dicasHtml}
        `;
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