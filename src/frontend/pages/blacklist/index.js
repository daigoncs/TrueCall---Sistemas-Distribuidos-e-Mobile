export default () => {
  const container = document.createElement("div");

  const template = `
    <div class="dashboard-page">

      <nav class="topbar">
        <span class="topbar-brand">True<span>Call</span></span>
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button id="btnVoltarDashboard" class="btn-logout" style="border-color: rgba(232, 87, 26, 0.4); color: #e8571a; font-weight: 600;">Painel Principal</button>
          <button id="btnIrQuiz" class="btn-logout" style="border-color: rgba(232, 87, 26, 0.4); color: #e8571a; font-weight: 600;">Simulador de Golpes</button>
          <button id="logout" class="btn-logout">Sair</button>
        </div>
      </nav>

      <main class="dashboard-main" style="max-width: 800px; margin: 0 auto; padding: 2.25rem 1.5rem 4rem;">
        
        <div class="dashboard-header" style="margin-bottom: 2rem; border-bottom: 1px solid #ebebeb; padding-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.25rem; align-items: flex-start;">
          <h1 style="font-family: 'Sora', sans-serif; font-size: 1.75rem; font-weight: 700; color: #111111; margin: 0;">Blacklist de Golpes Recentes</h1>
          <p style="font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: #6b7280; margin: 0;">Linha do tempo atualizada em tempo real com as últimas fraudes denunciadas pela comunidade.</p>
        </div>

        <div id="feedBlacklist" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="font-size: 0.9rem; color: #6b7280; text-align: center; padding: 2rem;">
            Carregando golpes recentes...
          </div>
        </div>

      </main>

    </div>
  `;

  container.innerHTML = template;

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.hash = "#login";
    return container;
  }

  // Navegacao
  container.querySelector("#btnVoltarDashboard").addEventListener("click", () => {
    window.location.hash = "#dashboard";
  });

  container.querySelector("#btnIrQuiz").addEventListener("click", () => {
    window.location.hash = "#quiz";
  });

  container.querySelector("#logout").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.hash = "#login";
  });

  async function carregarListaNegra() {
    const feed = container.querySelector("#feedBlacklist");
    if (!feed) return;

    try {
      const response = await fetch("http://localhost:5000/api/denuncias/publico/recentes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dados = await response.json();

      if (dados.length === 0) {
        feed.innerHTML = `
          <div style="font-size: 0.9rem; color: #6b7280; text-align: center; padding: 3rem; background: #ffffff; border: 1.5px solid #ebebeb; border-radius: 14px;">
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
          minute: "2-digit"
        });

        const badgeEstado = d.estado ? `<span style="background-color: #f3f4f6; color: #4b5563; font-size: 0.725rem; font-weight: 700; padding: 3px 8px; border-radius: 6px;">${d.estado}</span>` : "";

        feed.innerHTML += `
          <div class="cardDenuncia" style="display: grid; grid-template-columns: 1fr auto; padding: 1.5rem; border: 1.5px solid #ebebeb; border-radius: 14px; background: #ffffff; gap: 0.25rem 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); transition: border-color 0.2s;">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <h3 style="font-family: 'Sora', sans-serif; font-size: 1.2rem; color: #b91c1c; margin: 0; font-weight: 700;">${d.telefone}</h3>
              <span class="badge-tipo" style="background-color: #fef2f2; color: #991b1b; font-size: 0.725rem; font-weight: 700; padding: 3px 8px; border-radius: 6px;">${d.tipo_golpe}</span>
              ${badgeEstado}
            </div>
            <span style="font-size: 0.775rem; color: #9ca3af; text-align: right; grid-column: 2; align-self: center;">${dataFormatada}</span>
            <div style="grid-column: 1 / -1; margin-top: 0.75rem; border-top: 1px dashed #f3f4f6; padding-top: 0.75rem;">
              <span style="font-size: 0.85rem; color: #6b7280; display: block; margin-bottom: 0.5rem;"><strong>Instituição visada:</strong> ${d.instituicao || "Não informada"}</span>
              <p style="margin: 0; font-size: 0.9rem; color: #374151; line-height: 1.5; word-break: break-word;">${d.descricao}</p>
            </div>
          </div>
        `;
      });

    } catch (e) {
      console.error(e);
      feed.innerHTML = `
        <div style="font-size: 0.9rem; color: #991b1b; text-align: center; padding: 3rem; background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 14px;">
          Erro de conexão ao carregar a blacklist. Tente novamente mais tarde.
        </div>
      `;
    }
  }

  carregarListaNegra();
  return container;
};
