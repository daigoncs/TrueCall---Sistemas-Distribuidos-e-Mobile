export default () => {
  const container = document.createElement("div");

  container.innerHTML = `
    <div class="dashboard-page">

      <nav class="topbar">
        <span class="topbar-brand">True<span>Call</span></span>
        <button id="logout" class="btn-logout">Sair</button>
      </nav>

      <main class="dashboard-main">
        <div class="dashboard-header">
          <h1>Minhas Denúncias</h1>
          <button id="novaDenuncia" class="btn-nova">+ Nova Denúncia</button>
        </div>

        <div id="listaDenuncias"></div>
      </main>

    </div>
  `;

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.hash = "#login";
    return container;
  }

  container.querySelector("#novaDenuncia").addEventListener("click", () => {
    window.location.hash = "#denuncia";
  });

  container.querySelector("#logout").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.hash = "#login";
  });

  async function carregarDenuncias() {
    const lista = container.querySelector("#listaDenuncias");

    // Skeleton de loading
    lista.innerHTML = `
      <div class="skeleton"></div>
      <div class="skeleton"></div>
      <div class="skeleton"></div>
    `;

    try {
      const response = await fetch("http://localhost:5000/api/denuncias", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const denuncias = await response.json();
      lista.innerHTML = "";

      if (denuncias.length === 0) {
        lista.innerHTML = `
          <div class="empty-state">
            <p>Nenhuma denúncia registrada ainda.</p>
          </div>
        `;
        return;
      }

      denuncias.forEach((d) => {
        lista.innerHTML += `
          <div class="cardDenuncia">
            <h3>${d.telefone}</h3>
            <span class="badge-tipo">${d.tipo_golpe}</span>
            <div class="card-meta">
              <span><strong>Instituição:</strong> ${d.instituicao}</span>
              <span><strong>Tipo:</strong> ${d.tipo_golpe}</span>
            </div>
            <p class="card-descricao">${d.descricao}</p>
            <button class="btnExcluir" data-id="${d.id}">Excluir</button>
          </div>
        `;
      });

      lista.querySelectorAll(".btnExcluir").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!confirm("Excluir denúncia?")) return;
          await fetch(`http://localhost:5000/api/denuncias/${btn.dataset.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          carregarDenuncias();
        });
      });

    } catch (error) {
      lista.innerHTML = `
        <div class="empty-state">
          <p>Erro ao carregar denúncias. Tente novamente.</p>
        </div>
      `;
      console.error(error);
    }
  }

  carregarDenuncias();
  return container;
};