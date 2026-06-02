export default () => {
  const container = document.createElement("div");

  container.innerHTML = `
    <div class="container">

      <h1>Registrar Denúncia</h1>

      <input
        id="telefone"
        placeholder="Telefone"
      >

      <textarea
        id="descricao"
        placeholder="Descrição"
      ></textarea>

      <select id="instituicao"></select>

      <input
        id="instituicaoPersonalizada"
        placeholder="Instituição personalizada"
      >

      <select id="tipoGolpe"></select>

      <button id="btnSalvar">
        Registrar
      </button>

      <button id="btnVoltar">
        Voltar
      </button>

      <p id="message"></p>

    </div>
  `;

  const token = localStorage.getItem("token");

  const msg = container.querySelector("#message");

  async function carregarInstituicoes() {
    const response = await fetch("http://localhost:5000/api/instituicoes");

    const dados = await response.json();

    const select = container.querySelector("#instituicao");

    select.innerHTML = "";

    dados.forEach((inst) => {
      select.innerHTML += `
        <option value="${inst.id}">
          ${inst.nome}
        </option>
      `;
    });
  }

  async function carregarTipos() {
    const response = await fetch("http://localhost:5000/api/tipos-golpe");

    const dados = await response.json();

    const select = container.querySelector("#tipoGolpe");

    select.innerHTML = "";

    dados.forEach((tipo) => {
      select.innerHTML += `
        <option value="${tipo.id}">
          ${tipo.nome}
        </option>
      `;
    });
  }

  carregarInstituicoes();
  carregarTipos();

  const btnSalvar = container.querySelector("#btnSalvar");

  btnSalvar.addEventListener("click", async () => {
    try {
      const response = await fetch("http://localhost:5000/api/denuncias", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          telefone: container.querySelector("#telefone").value,

          descricao: container.querySelector("#descricao").value,

          instituicao_id: container.querySelector("#instituicao").value,

          tipo_golpe_id: container.querySelector("#tipoGolpe").value,

          instituicao_personalizada: container.querySelector(
            "#instituicaoPersonalizada",
          ).value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro);
      }

      msg.innerHTML = "Denúncia registrada com sucesso";

      setTimeout(() => {
        window.location.hash = "#dashboard";
      }, 1500);
    } catch (error) {
      msg.innerHTML = error.message;
    }
  });

  const btnVoltar = container.querySelector("#btnVoltar");

  btnVoltar.addEventListener("click", () => {
    window.location.hash = "#dashboard";
  });

  return container;
};
