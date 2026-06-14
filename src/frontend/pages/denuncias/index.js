export default () => {
  const container = document.createElement("div");

  container.innerHTML = `
    <div class="denuncia-page">

      <nav class="topbar">
        <span class="topbar-brand">True<span>Call</span></span>
        <button id="btnVoltar" class="btn-logout btn-secondary">← Voltar</button>
      </nav>

      <main class="denuncia-main">

        <div class="denuncia-header">
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

          <div style="margin-top: 15px; margin-bottom: 15px;">
            <label for="estado">Estado (UF)</label>
            <div class="select-wrapper">
              <select id="estado" class="input" style="width: 100%; border: 1px solid #ccc; border-radius: 4px; padding: 8px; box-sizing: border-box;">
                <option value="">Selecionar estado...</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
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

          <div id="wrapperTipoPersonalizado" style="display: none;">
            <label for="tipoPersonalizado">Qual tipo de golpe?</label>
            <input
              id="tipoPersonalizado"
              class="input"
              placeholder="Ex: Golpe do Motoboy"
            />
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="descricao" style="margin-bottom: 0;">Descrição</label>
            <span id="charCount" style="font-size: 0.75rem; color: #6b6b6b; font-family: 'DM Sans', sans-serif;">0/300</span>
          </div>
          <textarea
            id="descricao"
            placeholder="Descreva o que aconteceu na ligação..."
            maxlength="300"
            style="margin-top: 0.4rem;"
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

  // Máscara adaptativa: celular (9 dígitos) vs. fixo (8 dígitos)
  // Regra: se o 3º dígito (1º após o DDD) for '9' → celular → 11 dígitos total
  //        se não for '9'                          → fixo   → 10 dígitos total
  inputTel.addEventListener("input", (e) => {
    let valor = e.target.value.replace(/\D/g, "");

    // Determina o limite: só decide quando já temos DDD + 1 dígito local
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
      // Fixo: (11) 3333-4444  |  Celular ainda construindo: (11) 9999-4444
      e.target.value = `(${valor.slice(0, 2)}) ${valor.slice(2, 6)}-${valor.slice(6)}`;
    } else {
      // Celular completo: (11) 99999-4444
      e.target.value = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
    }
  });

  const inputDesc = container.querySelector("#descricao");
  const charCount = container.querySelector("#charCount");
  inputDesc.addEventListener("input", (e) => {
    charCount.textContent = `${e.target.value.length}/300`;
  });

  // Mostra campo personalizada quando "Outro" for selecionado
  selInst.addEventListener("change", () => {
    const isOutro =
      selInst.options[selInst.selectedIndex]?.text.toLowerCase() === "outro";
    container.querySelector("#wrapperPersonalizada").style.display = isOutro
      ? "block"
      : "none";
  });

  const selTipo = container.querySelector("#tipoGolpe");
  selTipo.addEventListener("change", () => {
    const isOutro =
      selTipo.options[selTipo.selectedIndex]?.text.toLowerCase() === "outro";
    container.querySelector("#wrapperTipoPersonalizado").style.display = isOutro
      ? "block"
      : "none";
  });

  async function carregarInstituicoes() {
    const response = await fetch("https://truecall-sistemas-distribuidos-e-mobile-1.onrender.com/api/instituicoes");
    const dados = await response.json();
    selInst.innerHTML =
      `<option value="">Selecionar...</option>` +
      dados.map((i) => `<option value="${i.id}">${i.nome}</option>`).join("");
  }

  async function carregarTipos() {
    const response = await fetch("https://truecall-sistemas-distribuidos-e-mobile-1.onrender.com/api/tipos-golpe");
    const dados = await response.json();
    selTipo.innerHTML =
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

    // Valida: celular = 11 dígitos (3º dígito é '9'); fixo = 10 dígitos
    const ehCelular = telefoneLimpo.length >= 3 && telefoneLimpo[2] === "9";
    const tamanhoEsperado = ehCelular ? 11 : 10;

    if (telefoneLimpo.length !== tamanhoEsperado) {
      msg.className = "denuncia-msg error";
      msg.innerHTML =
        ehCelular || telefoneLimpo.length < 3
          ? "Celulares precisam de DDD + 9 dígitos. Ex: (11) 99999-9999"
          : "Fixos precisam de DDD + 8 dígitos. Ex: (11) 3333-4444";
      return;
    }

    try {
      const response = await fetch("https://truecall-sistemas-distribuidos-e-mobile-1.onrender.com/api/denuncias", {
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
          tipo_golpe_personalizado:
            container.querySelector("#tipoPersonalizado").value,
          estado: container.querySelector("#estado").value,
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
