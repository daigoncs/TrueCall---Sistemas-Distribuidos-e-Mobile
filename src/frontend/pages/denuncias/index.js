export default () => {
  const container = document.createElement("div");

  container.innerHTML = `
    <div class="denuncia-page">

      <nav class="topbar">
        <span class="topbar-brand">True<span>Call</span></span>
      </nav>

      <main class="denuncia-main">

        <div class="denuncia-header">
          <button id="btnVoltar" class="btn-voltar">←</button>
          <h1>Registrar denúncia</h1>
        </div>

        <div class="denuncia-card">

          <label for="telefone">Telefone suspeito</label>
          <input
            id="telefone"
            class="input"
            placeholder="+55 11 99999-9999"
          />

          <div class="input-row">
            <div>
              <label for="instituicao">Instituição</label>
              <div class="select-wrapper">
                <select id="instituicao"></select>
              </div>
            </div>
            <div>
              <label for="tipoGolpe">Tipo de golpe</label>
              <div class="select-wrapper">
                <select id="tipoGolpe"></select>
              </div>
            </div>
          </div>

          <div id="wrapperPersonalizada" style="display: none;">
            <label for="instituicaoPersonalizada">Qual instituição?</label>
            <input
              id="instituicaoPersonalizada"
              class="input"
              placeholder="Ex: Banco XYZ"
            />
          </div>

          <label for="descricao">Descrição</label>
          <textarea
            id="descricao"
            placeholder="Descreva o que aconteceu na ligação..."
          ></textarea>

          <p id="message" class="denuncia-msg"></p>

          <button id="btnSalvar" class="btn-registrar">
            Registrar denúncia
          </button>

          <button id="btnVoltar2" class="btn-cancelar">
            Cancelar
          </button>

        </div>
      </main>
    </div>
  `;

  const token = localStorage.getItem("token");
  const msg = container.querySelector("#message");
  const selInst = container.querySelector("#instituicao");
  const inputTel = container.querySelector("#telefone");

  // Mascara de telefone (celular/fixo) automatica
  inputTel.addEventListener("input", (e) => {
    let valor = e.target.value.replace(/\D/g, "");
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
  });

  // Mostra campo personalizada quando "Outro" for selecionado
  selInst.addEventListener("change", () => {
    const isOutro =
      selInst.options[selInst.selectedIndex]?.text.toLowerCase() === "outro";
    container.querySelector("#wrapperPersonalizada").style.display = isOutro
      ? "block"
      : "none";
  });

  async function carregarInstituicoes() {
    const response = await fetch("http://localhost:5000/api/instituicoes");
    const dados = await response.json();
    selInst.innerHTML =
      `<option value="">Selecionar...</option>` +
      dados.map((i) => `<option value="${i.id}">${i.nome}</option>`).join("");
  }

  async function carregarTipos() {
    const response = await fetch("http://localhost:5000/api/tipos-golpe");
    const dados = await response.json();
    container.querySelector("#tipoGolpe").innerHTML =
      `<option value="">Selecionar...</option>` +
      dados.map((t) => `<option value="${t.id}">${t.nome}</option>`).join("");
  }

  carregarInstituicoes();
  carregarTipos();

  container.querySelector("#btnSalvar").addEventListener("click", async () => {
    msg.className = "denuncia-msg";
    msg.innerHTML = "";

    const telefoneVal = inputTel.value;
    const telefoneLimpo = telefoneVal.replace(/\D/g, "");

    if (telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) {
      msg.className = "denuncia-msg error";
      msg.innerHTML = "Por favor, insira um telefone válido com DDD (10 ou 11 dígitos).";
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/denuncias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          telefone: telefoneVal,
          descricao: container.querySelector("#descricao").value,
          instituicao_id: container.querySelector("#instituicao").value,
          tipo_golpe_id: container.querySelector("#tipoGolpe").value,
          instituicao_personalizada: container.querySelector(
            "#instituicaoPersonalizada",
          ).value,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.erro);

      msg.className = "denuncia-msg success";
      msg.innerHTML = "Denúncia registrada com sucesso!";

      setTimeout(() => {
        window.location.hash = "#dashboard";
      }, 1500);
    } catch (error) {
      msg.className = "denuncia-msg error";
      msg.innerHTML = error.message;
    }
  });

  // Dois botões de voltar (header e cancelar) fazem a mesma coisa
  container.querySelectorAll("#btnVoltar, #btnVoltar2").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.hash = "#dashboard";
    });
  });

  return container;
};
