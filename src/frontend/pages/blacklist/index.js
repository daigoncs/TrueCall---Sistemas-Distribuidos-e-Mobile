import { API_URL } from "../../config.js";

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default () => {
  const container = document.createElement("div");

  container.innerHTML = `
    <div class="page-container">

      <nav class="topbar">
        <span class="topbar-brand">True<span>Call</span></span>

        <div class="topbar-menuButtons">
          <button id="btnVoltar" class="btn-logout btn-secondary">← Voltar</button>
        </div>

      </nav>

      <main class="dashboard-main">

        <div class="dashboard-header">
          <h1>Blacklist de Golpes Recentes</h1>
          <p class="subtitulo">Linha do tempo atualizada em tempo real com as últimas fraudes denunciadas pela comunidade.</p>
        </div>

        <div id="feedBlacklist">
          <div class="feed-status">
            Carregando golpes recentes...
          </div>
        </div>

      </main>

    </div>
  `;

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.hash = "#login";
    return container;
  }

  async function carregarListaNegra() {
    const feed = container.querySelector("#feedBlacklist");
    if (!feed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/denuncias/publico/recentes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const dados = await response.json();

      if (dados.length === 0) {
        feed.innerHTML = `
          <div class="feed-status container-vazio">
            Nenhum golpe relatado recentemente no sistema.
          </div>
        `;
        return;
      }

      feed.innerHTML = "";
      dados.forEach((d) => {
        const dataObj = new Date(d.data_denuncia);
        const dataFormatada = dataObj.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        const badgeEstadoSafe = d.estado
          ? `<span class="badge-estado">${escapeHtml(d.estado)}</span>`
          : "";

        feed.innerHTML += `
          <div class="cardDenuncia">
            <div class="card-topo">
              <h3>${escapeHtml(d.telefone)}</h3>
              <span class="badge-tipo">${escapeHtml(d.tipo_golpe)}</span>
              ${badgeEstadoSafe}
            </div>
            <span class="card-data">${escapeHtml(dataFormatada)}</span>
            <div class="card-corpo">
              <span class="card-instituicao"><strong>Instituição visada:</strong> ${escapeHtml(d.instituicao) || "Não informada"}</span>
              <p class="card-descricao">${escapeHtml(d.descricao)}</p>
            </div>
          </div>
        `;
      });
    } catch (e) {
      console.error(e);
      feed.innerHTML = `
        <div class="feed-status container-erro">
          Erro de conexão ao carregar a blacklist. Tente novamente mais tarde.
        </div>
      `;
    }
  }

  container.querySelectorAll("#btnVoltar, #btnVoltar2").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.hash = "#dashboard";
    });
  });

  carregarListaNegra();
  return container;
};
