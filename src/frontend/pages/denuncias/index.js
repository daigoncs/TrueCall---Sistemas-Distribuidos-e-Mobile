import { fetchApi, fetchAuthApi } from "../../utils/api.js";
import { aplicarMascaraTelefone, obterTamanhoEsperadoTelefone } from "../../utils/masks.js";
import { requireAuth } from "../../utils/auth.js";
import { gerarOptionsEstados } from "../../utils/estados.js";
import { popularSelect, monitorarSelecaoOutro } from "../../utils/dom.js";

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
                ${gerarOptionsEstados()}
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

  const token = requireAuth();
  if (!token) return container;

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
    e.target.value = aplicarMascaraTelefone(e.target.value);
  });

  elements.inputDesc.addEventListener("input", (e) => {
    elements.charCount.textContent = `${e.target.value.length}/300`;
  });

  monitorarSelecaoOutro(container, elements.selInst, "#wrapperPersonalizada");
  monitorarSelecaoOutro(container, elements.selTipo, "#wrapperTipoPersonalizado");

  container.querySelectorAll("#btnVoltar, #btnVoltar2").forEach((btn) => {
    btn.addEventListener("click", () => (window.location.hash = "#dashboard"));
  });

  popularSelect("instituicoes", elements.selInst);
  popularSelect("tipos-golpe", elements.selTipo);

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

      const response = await fetchAuthApi("denuncias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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
