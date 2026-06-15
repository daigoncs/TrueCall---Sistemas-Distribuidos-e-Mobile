// ==========================================
// FUNÇÕES AUXILIARES (Puras e Isoladas)
// ==========================================

const formatarTelefone = (valor) => {
  let num = valor.replace(/\D/g, "");
  const ehCelular = num.length >= 3 && num[2] === "9";
  const limite = ehCelular ? 11 : 10;

  if (num.length > limite) num = num.slice(0, limite);
  if (num.length === 0) return "";
  if (num.length <= 2) return `(${num}`;
  if (num.length <= 6) return `(${num.slice(0, 2)}) ${num.slice(2)}`;
  if (num.length <= 10)
    return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`;
  return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`;
};

const obterTamanhoEsperadoTelefone = (telefoneLimpo) => {
  const ehCelular = telefoneLimpo.length >= 3 && telefoneLimpo[2] === "9";
  return { ehCelular, tamanhoEsperado: ehCelular ? 11 : 10 };
};

export default () => {
  const container = document.createElement("div");

  container.innerHTML = `
    <div class="page-container">
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
          <input id="telefone" class="input" placeholder="+55 11 99999-9999" />

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
            <input id="instituicaoPersonalizada" class="input" placeholder="Ex: Banco XYZ" />
          </div>

          <div id="wrapperTipoPersonalizado" style="display: none;">
            <label for="tipoPersonalizado">Qual tipo de golpe?</label>
            <input id="tipoPersonalizado" class="input" placeholder="Ex: Golpe do Motoboy" />
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="descricao" style="margin-bottom: 0;">Descrição</label>
            <span id="charCount" style="font-size: 0.75rem; color: #6b6b6b; font-family: 'DM Sans', sans-serif;">0/300</span>
          </div>
          <textarea id="descricao" placeholder="Descreva o que aconteceu na ligação..." maxlength="300" style="margin-top: 0.4rem;"></textarea>

          <p id="message" class="denuncia-msg"></p>

          <button id="btnSalvar" class="btn-registrar">Registrar denúncia</button>
          <button id="btnVoltar2" class="btn-cancelar">Cancelar</button>
        </div>
      </main>
    </div>
  `;

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.hash = "#login";
    return container;
  }

  const elements = {
    msg: container.querySelector("#message"),
    selInst: container.querySelector("#instituicao"),
    selTipo: container.querySelector("#tipoGolpe"),
    inputTel: container.querySelector("#telefone"),
    inputDesc: container.querySelector("#descricao"),
    charCount: container.querySelector("#charCount"),
    btnHamburguer: container.querySelector("#btnHamburguer"),
    menuItens: container.querySelector("#topbarDropdown"),
  };

  elements.inputTel.addEventListener("input", (e) => {
    e.target.value = formatarTelefone(e.target.value);
  });

  elements.inputDesc.addEventListener("input", (e) => {
    elements.charCount.textContent = `${e.target.value.length}/300`;
  });

  const monitorarSelecaoOutro = (selectElement, wrapperId) => {
    selectElement.addEventListener("change", () => {
      const textoSelecionado =
        selectElement.options[selectElement.selectedIndex]?.text.toLowerCase();
      container.querySelector(wrapperId).style.display =
        textoSelecionado === "outro" ? "block" : "none";
    });
  };
  monitorarSelecaoOutro(elements.selInst, "#wrapperPersonalizada");
  monitorarSelecaoOutro(elements.selTipo, "#wrapperTipoPersonalizado");

  container.querySelectorAll("#btnVoltar, #btnVoltar2").forEach((btn) => {
    btn.addEventListener("click", () => (window.location.hash = "#dashboard"));
  });

  const buscarDadosApi = async (endpoint, selectElement) => {
    try {
      const response = await fetch(
        `https://truecall.onrender.com/api/${endpoint}`,
      );
      if (!response.ok) {
        throw new Error(`Servidor retornou ${response.status}`);
      }
      const dados = await response.json();
      selectElement.innerHTML =
        `<option value="">Selecionar...</option>` +
        dados
          .map((item) => `<option value="${item.id}">${item.nome}</option>`)
          .join("");
    } catch (err) {
      console.error(`Erro ao carregar ${endpoint}:`, err);
      selectElement.innerHTML = `<option value="">Erro ao carregar</option>`;
    }
  };

  buscarDadosApi("instituicoes", elements.selInst);
  buscarDadosApi("tipos-golpe", elements.selTipo);

  container.querySelector("#btnSalvar").addEventListener("click", async () => {
    elements.msg.className = "denuncia-msg";
    elements.msg.innerHTML = "";

    const telefoneVal = elements.inputTel.value;
    const telefoneLimpo = telefoneVal.replace(/\D/g, "");
    const { ehCelular, tamanhoEsperado } =
      obterTamanhoEsperadoTelefone(telefoneLimpo);

    if (telefoneLimpo.length !== tamanhoEsperado) {
      elements.msg.className = "denuncia-msg error";
      elements.msg.innerHTML =
        ehCelular || telefoneLimpo.length < 3
          ? "Celulares precisam de DDD + 9 dígitos. Ex: (11) 99999-9999"
          : "Fixos precisam de DDD + 8 dígitos. Ex: (11) 3333-4444";
      return;
    }

    try {
      const payload = {
        telefone: telefoneVal,
        descricao: elements.inputDesc.value,
        instituicao_id: elements.selInst.value,
        tipo_golpe_id: elements.selTipo.value,
        instituicao_personalizada: container.querySelector(
          "#instituicaoPersonalizada",
        ).value,
        tipo_golpe_personalizado:
          container.querySelector("#tipoPersonalizado").value,
        estado: container.querySelector("#estado").value,
      };

      const response = await fetch(
        "https://truecall.onrender.com/api/denuncias",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.erro);

      elements.msg.className = "denuncia-msg success";
      elements.msg.innerHTML = "Denúncia registrada com sucesso!";

      setTimeout(() => (window.location.hash = "#dashboard"), 1500);
    } catch (error) {
      elements.msg.className = "denuncia-msg error";
      elements.msg.innerHTML = error.message;
    }
  });

  return container;
};
