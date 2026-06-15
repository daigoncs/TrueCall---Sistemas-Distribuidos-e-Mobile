export default () => {
  const container = document.createElement("div");

  container.innerHTML = `
    <div class="page-container">

<nav class="topbar">
  <span class="topbar-brand">True<span>Call</span></span>

  <!-- Menu normal (desktop) -->
  <div class="topbar-menu">
    <button id="btnIrBlacklist" class="btn-logout btn-secondary">Blacklist de Golpes</button>
    <button id="btnIrQuiz" class="btn-logout btn-secondary">Simulador de Golpes</button>
    <button id="logout" class="btn-logout">Sair</button>
  </div>

  <!-- Hambúrguer (mobile) -->
  <button class="topbar-hamburguer" id="btnHamburguer" aria-label="Menu">
    <span></span>
    <span></span>
    <span></span>
  </button>
  <div class="topbar-dropdown" id="topbarDropdown">
    <button id="btnIrBlacklistMobile" class="btn-logout btn-secondary">Blacklist de Golpes</button>
    <button id="btnIrQuizMobile" class="btn-logout btn-secondary">Simulador de Golpes</button>
    <button id="logoutMobile" class="btn-logout">Sair</button>
  </div>
</nav>

      <main class="dashboard-main">
        <div class="dashboard-content">

          <section class="coluna-denuncias">
            <div class="dashboard-header">
              <h1>Minhas Denúncias</h1>
              <div class="header-buttons">
                <button id="btnExportar" class="btn-exportar" title="Exportar denúncias para CSV">Exportar Lista</button>
                <button id="novaDenuncia" class="btn-nova">+ Nova Denúncia</button>
              </div>
            </div>

            <!-- Painel de Gráficos em Linha (Grid) -->
            <div class="dashboard-graficos-row" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
              <!-- Gráfico de pizza: Tipo de Golpe -->
              <div id="graficoCard" class="grafico-card" style="display:none; flex: 1; min-width: 280px; margin-bottom: 0;">
                <div class="grafico-header">
                  <span class="grafico-titulo">Distribuição por Tipo de Golpe</span>
                </div>
                <div class="grafico-body" style="display: flex; flex-direction: column; align-items: center; gap: 1rem; text-align: center;">
                  <canvas id="pizzaCanvas" width="140" height="140"></canvas>
                  <ul id="graficoLegenda" class="grafico-legenda" style="margin-top: 0.5rem; justify-content: center; width: 100%;"></ul>
                  <div id="graficoBanner" class="grafico-banner" style="margin-top: 0.5rem; width: 100%; box-sizing: border-box; text-align: left;"></div>
                </div>
              </div>

              <!-- Distribuição Geográfica de Golpes (Pizza) -->
              <div id="regioesCard" class="grafico-card" style="display:none; flex: 1; min-width: 280px; margin-bottom: 0;">
                <div class="grafico-header">
                  <span class="grafico-titulo">Distribuição de Golpes por região</span>
                </div>
                <div class="grafico-body" style="display: flex; flex-direction: column; align-items: center; gap: 1rem; text-align: center;">
                  <canvas id="regioesCanvas" width="140" height="140"></canvas>
                  <ul id="legendaRegioes" class="grafico-legenda" style="margin-top: 0.5rem; justify-content: center; width: 100%;"></ul>
                </div>
              </div>
            </div>

            <div id="listaDenuncias"></div>
          </section>

          <aside class="coluna-numeros">
            <div class="numeros-header">
              <h2>Números Oficiais</h2>
              <button id="btnAdicionarNumero" class="btn-adicionar-numero" title="Adicionar número">+</button>
            </div>
            <p class="numeros-subtitulo">Confirme sempre pelo canal oficial antes de atender.</p>
            <div class="filtro-numeros-container">
              <select id="filtroInstituicao" class="select-filtro-instituicao">
                <option value="">Todas as instituições</option>
              </select>
            </div>
            <div class="numeros-table-wrap">
              <table class="numeros-table">
                <thead>
                  <tr>
                    <th>Instituição</th>
                    <th>Número Oficial</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="numerosBody"></tbody>
              </table>
            </div>
            <p class="numeros-aviso">Atenção: Bancos <strong>nunca</strong> ligam pedindo senha ou transferências.</p>
          </aside>

        </div>
      </main>

      <!-- Modal para adicionar número -->
      <div id="modalNumero" class="modal-overlay" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Adicionar número confiável</h3>
            <button id="btnFecharModal" class="modal-close">&times;</button>
          </div>
          <label for="inputInstituicao">Instituição</label>
          <input id="inputInstituicao" class="input" placeholder="Ex: Banco XYZ" />
          <label for="inputNumero">Número</label>
          <input id="inputNumero" class="input" placeholder="Ex: (11) 4004-0000" />
          <p id="modalMsg" class="modal-msg"></p>
          <button id="btnSalvarNumero" class="btn-registrar">Adicionar</button>
        </div>
      </div>

      <!-- Modal para editar denúncia -->
      <div id="modalEditar" class="modal-overlay" style="display:none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Editar Denúncia</h3>
            <button id="btnFecharModalEditar" class="modal-close">&times;</button>
          </div>
          
          <label for="editInstituicao">Instituição</label>
          <div class="select-wrapper">
            <select id="editInstituicao" class="input" style="width: 100%; border: 1px solid #ccc; border-radius: 4px; padding: 8px; box-sizing: border-box;"></select>
          </div>

          <div id="wrapperEditInstituicaoPersonalizada" style="display: none; margin-top: 10px;">
            <label for="editInstituicaoPersonalizada">Qual instituição?</label>
            <input id="editInstituicaoPersonalizada" class="input" placeholder="Ex: Banco XYZ" />
          </div>

          <label for="editTipoGolpe" style="margin-top: 15px; display: block;">Tipo de golpe</label>
          <div class="select-wrapper">
            <select id="editTipoGolpe" class="input" style="width: 100%; border: 1px solid #ccc; border-radius: 4px; padding: 8px; box-sizing: border-box;"></select>
          </div>

          <div id="wrapperEditTipoPersonalizado" style="display: none; margin-top: 10px;">
            <label for="editTipoPersonalizado">Qual tipo de golpe?</label>
            <input id="editTipoPersonalizado" class="input" placeholder="Ex: Golpe do Motoboy" />
          </div>

          <label for="editEstado" style="margin-top: 15px; display: block;">Estado (UF)</label>
          <div class="select-wrapper">
            <select id="editEstado" class="input" style="width: 100%; border: 1px solid #ccc; border-radius: 4px; padding: 8px; box-sizing: border-box;">
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

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
            <label for="editDescricao" style="margin-bottom: 0;">Descrição</label>
            <span id="editCharCount" style="font-size: 0.75rem; color: #6b6b6b; font-family: 'DM Sans', sans-serif;">0/300</span>
          </div>
          <textarea id="editDescricao" class="input" placeholder="Descreva o que aconteceu..." maxlength="300" style="min-height: 100px; width: 100%; border: 1px solid #ccc; border-radius: 4px; padding: 8px; font-family: inherit; box-sizing: border-box; resize: vertical;"></textarea>

          <p id="modalEditMsg" class="modal-msg"></p>
          <button id="btnSalvarEdicao" class="btn-registrar" style="margin-top: 15px; width: 100%;">Salvar Alterações</button>
        </div>
      </div>

    </div>
  `;

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.hash = "#login";
    return container;
  }

  const btnNovaDenuncia = container.querySelector("#novaDenuncia");
  const btnIrBlacklist = container.querySelector("#btnIrBlacklist");
  const btnIrQuiz = container.querySelector("#btnIrQuiz");
  const btnLogout = container.querySelector("#logout");

  const btnHamburguer = container.querySelector("#btnHamburguer");
  const menuItens = container.querySelector("#topbarDropdown");
  const btnIrBlacklistMobile = container.querySelector("#btnIrBlacklistMobile");
  const btnIrQuizMobile = container.querySelector("#btnIrQuizMobile");
  const logoutMobile = container.querySelector("#logoutMobile");

  const fecharMenu = () => {
    if (menuItens && btnHamburguer) {
      menuItens.classList.remove("active");
      btnHamburguer.classList.remove("open");
    }
  };

  if (btnNovaDenuncia) {
    btnNovaDenuncia.addEventListener("click", () => {
      window.location.hash = "#denuncia";
    });
  }

  if (btnIrBlacklist) {
    btnIrBlacklist.addEventListener("click", () => {
      window.location.hash = "#blacklist";
    });
  }

  if (btnIrQuiz) {
    btnIrQuiz.addEventListener("click", () => {
      window.location.hash = "#quiz";
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.hash = "#login";
    });
  }

  if (btnHamburguer && menuItens) {
    btnHamburguer.addEventListener("click", () => {
      menuItens.classList.toggle("active");
      btnHamburguer.classList.toggle("open");
    });
  }

  if (btnIrBlacklistMobile) {
    btnIrBlacklistMobile.addEventListener("click", () => {
      window.location.hash = "#blacklist";
      fecharMenu();
    });
  }

  if (btnIrQuizMobile) {
    btnIrQuizMobile.addEventListener("click", () => {
      window.location.hash = "#quiz";
      fecharMenu();
    });
  }

  if (logoutMobile) {
    logoutMobile.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.hash = "#login";
      fecharMenu();
    });
  }

  container.querySelector("#novaDenuncia").addEventListener("click", () => {
    window.location.hash = "#denuncia";
  });

  container.querySelector("#btnIrBlacklist").addEventListener("click", () => {
    window.location.hash = "#blacklist";
  });

  container.querySelector("#btnIrQuiz").addEventListener("click", () => {
    window.location.hash = "#quiz";
  });

  container.querySelector("#logout").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.hash = "#login";
  });

  let todosOsNumeros = [];

  function preencherFiltro(numeros) {
    const filtro = container.querySelector("#filtroInstituicao");
    const valorSelecionado = filtro.value;

    const instituicoesUnicas = [
      ...new Set(numeros.map((n) => n.instituicao)),
    ].sort();

    filtro.innerHTML = '<option value="">Todas as instituições</option>';
    instituicoesUnicas.forEach((inst) => {
      const option = document.createElement("option");
      option.value = inst;
      option.textContent = inst;
      if (inst === valorSelecionado) option.selected = true;
      filtro.appendChild(option);
    });
  }

  function renderizarLinhas(numeros, filtroVal) {
    const tbody = container.querySelector("#numerosBody");
    tbody.innerHTML = "";

    const numerosFiltrados = filtroVal
      ? numeros.filter((n) => n.instituicao === filtroVal)
      : numeros;

    if (numerosFiltrados.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align: center;">Nenhum número correspondente.</td></tr>`;
      return;
    }

    numerosFiltrados.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.instituicao}</td>
        <td>${item.numero}</td>
        <td><button class="btn-remover-numero" data-id="${item.id}" title="Remover">&times;</button></td>
      `;
      tbody.appendChild(tr);
    });

    // Eventos de remover
    tbody.querySelectorAll(".btn-remover-numero").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const tr = btn.closest("tr");
        const instituicao = tr.querySelector("td").textContent;
        if (!confirm(`Remover ${instituicao}?`)) return;

        try {
          const deleteResponse = await fetch(
            `https://truecall.onrender.com/api/instituicoes/confiaveis/${id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (deleteResponse.ok) {
            carregarNumerosConfiaveis();
          } else {
            const errData = await deleteResponse.json();
            alert(errData.erro || "Erro ao remover número.");
          }
        } catch (e) {
          console.error("Erro ao deletar número confiável:", e);
          alert("Erro ao remover número confiável.");
        }
      });
    });
  }

  async function carregarNumerosConfiaveis() {
    const tbody = container.querySelector("#numerosBody");
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center;">Carregando...</td></tr>`;

    try {
      const response = await fetch(
        "https://truecall.onrender.com/api/instituicoes/confiaveis",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      todosOsNumeros = await response.json();

    const filtro = container.querySelector("#filtroInstituicao");
    preencherFiltro(todosOsNumeros);
    renderizarLinhas(todosOsNumeros, filtro);

} catch (error) {
    tbody.innerHTML = `<tr><td colspan="3">Erro ao carregar dados</td></tr>`;
    console.error(error);
}
  }

  container
    .querySelector("#filtroInstituicao")
    .addEventListener("change", (e) => {
      renderizarLinhas(todosOsNumeros, e.target.value);
    });

  carregarNumerosConfiaveis();

  // -- Modal --
  const modal = container.querySelector("#modalNumero");
  const inputInst = container.querySelector("#inputInstituicao");
  const inputNum = container.querySelector("#inputNumero");
  const modalMsg = container.querySelector("#modalMsg");

  // Máscara flexível para número oficial (0800, 4004 ou celular/fixo local)
  inputNum.addEventListener("input", (e) => {
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

  container
    .querySelector("#btnAdicionarNumero")
    .addEventListener("click", () => {
      modal.style.display = "flex";
      inputInst.value = "";
      inputNum.value = "";
      modalMsg.textContent = "";
      inputInst.focus();
    });

  function fecharModal() {
    modal.style.display = "none";
  }

  container
    .querySelector("#btnFecharModal")
    .addEventListener("click", fecharModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });

  container
    .querySelector("#btnSalvarNumero")
    .addEventListener("click", async () => {
      const instituicao = inputInst.value.trim();
      const numero = inputNum.value.trim();

      modalMsg.className = "modal-msg";
      modalMsg.textContent = "";

      if (!instituicao || !numero) {
        modalMsg.className = "modal-msg error";
        modalMsg.textContent = "Preencha todos os campos.";
        return;
      }

      const numeroLimpo = numero.replace(/\D/g, "");
      if (
        numeroLimpo.length !== 8 &&
        numeroLimpo.length !== 10 &&
        numeroLimpo.length !== 11
      ) {
        modalMsg.className = "modal-msg error";
        modalMsg.textContent =
          "Número inválido. Digite um formato válido (celular, fixo, 0800 ou 4004).";
        return;
      }

      try {
        const response = await fetch(
          "https://truecall.onrender.com/api/instituicoes/confiaveis",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ instituicao, numero }),
          },
        );

        if (response.ok) {
          carregarNumerosConfiaveis();
          modalMsg.className = "modal-msg success";
          modalMsg.textContent = "Número adicionado com sucesso!";
          setTimeout(() => {
            fecharModal();
          }, 800);
        } else {
          const errData = await response.json();
          modalMsg.className = "modal-msg error";
          modalMsg.textContent = errData.erro || "Erro ao adicionar número.";
        }
      } catch (e) {
        console.error("Erro ao adicionar número confiável:", e);
        modalMsg.className = "modal-msg error";
        modalMsg.textContent = "Erro de conexão com o servidor.";
      }
    });

  // -- Modal Editar Denúncia --
  const modalEditar = container.querySelector("#modalEditar");
  const editInst = container.querySelector("#editInstituicao");
  const editTipo = container.querySelector("#editTipoGolpe");
  const editDesc = container.querySelector("#editDescricao");
  const editInstPers = container.querySelector("#editInstituicaoPersonalizada");
  const editTipoPers = container.querySelector("#editTipoPersonalizado");
  const editEstado = container.querySelector("#editEstado");
  const modalEditMsg = container.querySelector("#modalEditMsg");
  let denunciaSendoEditadaId = null;

  const editCharCount = container.querySelector("#editCharCount");
  editDesc.addEventListener("input", (e) => {
    editCharCount.textContent = `${e.target.value.length}/300`;
  });

  // Carregar opções dos selects para edição
  let instituicoesCarregadas = false;
  let tiposCarregados = false;

  async function prepararSelectsEdicao() {
    if (!instituicoesCarregadas) {
      try {
        const response = await fetch(
          "https://truecall.onrender.com/api/instituicoes",
        );
        const dados = await response.json();
        editInst.innerHTML =
          `<option value="">Selecionar...</option>` +
          dados
            .map((i) => `<option value="${i.id}">${i.nome}</option>`)
            .join("");
        instituicoesCarregadas = true;
      } catch (e) {
        console.error("Erro ao carregar instituições no modal de edição", e);
      }
    }

    if (!tiposCarregados) {
      try {
        const response = await fetch(
          "https://truecall.onrender.com/api/tipos-golpe",
        );
        const dados = await response.json();
        editTipo.innerHTML =
          `<option value="">Selecionar...</option>` +
          dados
            .map((t) => `<option value="${t.id}">${t.nome}</option>`)
            .join("");
        tiposCarregados = true;
      } catch (e) {
        console.error("Erro ao carregar tipos de golpe no modal de edição", e);
      }
    }
  }

  // Listeners de mudança nos selects do modal de edição
  editInst.addEventListener("change", () => {
    const isOutro =
      editInst.options[editInst.selectedIndex]?.text.toLowerCase() === "outro";
    container.querySelector(
      "#wrapperEditInstituicaoPersonalizada",
    ).style.display = isOutro ? "block" : "none";
  });

  editTipo.addEventListener("change", () => {
    const isOutro =
      editTipo.options[editTipo.selectedIndex]?.text.toLowerCase() === "outro";
    container.querySelector("#wrapperEditTipoPersonalizado").style.display =
      isOutro ? "block" : "none";
  });

  async function abrirModalEditar(id) {
    denunciaSendoEditadaId = id;
    modalEditMsg.textContent = "";
    modalEditMsg.className = "modal-msg";

    await prepararSelectsEdicao();

    const denuncia = todasAsDenuncias.find((d) => d.id == id);
    if (!denuncia) {
      alert("Denúncia não encontrada localmente.");
      return;
    }

    // Preenche os valores atuais
    editDesc.value = denuncia.descricao || "";
    container.querySelector("#editCharCount").textContent =
      `${(denuncia.descricao || "").length}/300`;
    editInst.value = denuncia.instituicao_id || "";
    editTipo.value = denuncia.tipo_golpe_id || "";
    editEstado.value = denuncia.estado || "";

    // Trata exibição dos campos personalizados
    const instIsOutro =
      editInst.options[editInst.selectedIndex]?.text.toLowerCase() === "outro";
    container.querySelector(
      "#wrapperEditInstituicaoPersonalizada",
    ).style.display = instIsOutro ? "block" : "none";
    editInstPers.value = instIsOutro
      ? denuncia.instituicao_personalizada || ""
      : "";

    const tipoIsOutro =
      editTipo.options[editTipo.selectedIndex]?.text.toLowerCase() === "outro";
    container.querySelector("#wrapperEditTipoPersonalizado").style.display =
      tipoIsOutro ? "block" : "none";
    editTipoPers.value = tipoIsOutro
      ? denuncia.tipo_golpe_personalizado || ""
      : "";

    modalEditar.style.display = "flex";
  }

  function fecharModalEditar() {
    modalEditar.style.display = "none";
    denunciaSendoEditadaId = null;
  }

  container
    .querySelector("#btnFecharModalEditar")
    .addEventListener("click", fecharModalEditar);

  modalEditar.addEventListener("click", (e) => {
    if (e.target === modalEditar) fecharModalEditar();
  });

  container
    .querySelector("#btnSalvarEdicao")
    .addEventListener("click", async () => {
      modalEditMsg.className = "modal-msg";
      modalEditMsg.textContent = "";

      const descricao = editDesc.value.trim();
      const instituicao_id = editInst.value;
      const tipo_golpe_id = editTipo.value;
      const instituicao_personalizada = editInstPers.value.trim();
      const tipo_golpe_personalizado = editTipoPers.value.trim();
      const estado = editEstado.value;

      if (!descricao || !instituicao_id || !tipo_golpe_id) {
        modalEditMsg.className = "modal-msg error";
        modalEditMsg.textContent = "Preencha todos os campos obrigatórios.";
        return;
      }

      try {
        const response = await fetch(
          `https://truecall.onrender.com/api/denuncias/${denunciaSendoEditadaId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              descricao,
              instituicao_id,
              tipo_golpe_id,
              instituicao_personalizada,
              tipo_golpe_personalizado,
              estado,
            }),
          },
        );

        if (response.ok) {
          modalEditMsg.className = "modal-msg success";
          modalEditMsg.textContent = "Denúncia atualizada com sucesso!";
          setTimeout(() => {
            fecharModalEditar();
            carregarDenuncias();
          }, 800);
        } else {
          const errData = await response.json();
          modalEditMsg.className = "modal-msg error";
          modalEditMsg.textContent =
            errData.erro || "Erro ao atualizar denúncia.";
        }
      } catch (e) {
        console.error("Erro ao atualizar denúncia:", e);
        modalEditMsg.className = "modal-msg error";
        modalEditMsg.textContent = "Erro de conexão com o servidor.";
      }
    });

  // ── Gráfico de pizza (Canvas API nativa) ──────────────────────────────
  const CORES_PIZZA = [
    "#e8571a",
    "#f5a623",
    "#4a90d9",
    "#7b68ee",
    "#2ecc71",
    "#e74c3c",
    "#1abc9c",
    "#9b59b6",
    "#34495e",
    "#f39c12",
  ];

  function desenharGraficoPizza(contagem) {
    const card = container.querySelector("#graficoCard");
    const canvas = container.querySelector("#pizzaCanvas");
    const legenda = container.querySelector("#graficoLegenda");
    const banner = container.querySelector("#graficoBanner");
    const ctx = canvas.getContext("2d");

    const entradas = Object.entries(contagem).sort((a, b) => b[1] - a[1]);
    const total = entradas.reduce((s, [, v]) => s + v, 0);

    if (total === 0) {
      card.style.display = "none";
      return;
    }
    card.style.display = "block";

    // ── Desenho do gráfico ────────────────────────────────────────────
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 10;
    const rInterno = r * 0.42; // furo central (rosquinha)

    let angulo = -Math.PI / 2; // começa no topo

    entradas.forEach(([, qtd], i) => {
      const fatia = (qtd / total) * 2 * Math.PI;
      const cor = CORES_PIZZA[i % CORES_PIZZA.length];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angulo, angulo + fatia);
      ctx.closePath();
      ctx.fillStyle = cor;
      ctx.fill();

      // Borda fina entre fatias
      ctx.strokeStyle = "#f7f7f8";
      ctx.lineWidth = 2;
      ctx.stroke();

      angulo += fatia;
    });

    // Furo central — efeito rosquinha (donut chart)
    ctx.beginPath();
    ctx.arc(cx, cy, rInterno, 0, 2 * Math.PI);
    ctx.fillStyle = "#f7f7f8";
    ctx.fill();

    // Texto central: total de denúncias
    ctx.fillStyle = "#111111";
    ctx.font = `bold ${Math.round(r * 0.28)}px Sora, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total, cx, cy - 6);
    ctx.font = `${Math.round(r * 0.14)}px DM Sans, sans-serif`;
    ctx.fillStyle = "#888";
    ctx.fillText("denúncias", cx, cy + 13);

    // ── Legenda ───────────────────────────────────────────────────────
    legenda.innerHTML = "";
    entradas.forEach(([golpe, qtd], i) => {
      const pct = ((qtd / total) * 100).toFixed(0);
      const li = document.createElement("li");
      li.className = "legenda-item";
      li.innerHTML = `
        <span class="legenda-cor" style="background:${CORES_PIZZA[i % CORES_PIZZA.length]}"></span>
        <span class="legenda-nome">${golpe}</span>
        <span class="legenda-pct">${pct}%</span>
      `;
      legenda.appendChild(li);
    });

    // ── Banner de alerta contextual ───────────────────────────────────
    const [golpeTopo, qtdTopo] = entradas[0];
    const pctTopo = ((qtdTopo / total) * 100).toFixed(0);
    banner.className = "grafico-banner";
    banner.innerHTML = `
      <span><strong>${golpeTopo}</strong> representa <strong>${pctTopo}%</strong> das suas
      denúncias. Fique alerta a contatos simulando essa abordagem.</span>
    `;
  }

  // ── Gráfico de pizza por Regiões do Brasil ────────────────────────
  const CORES_REGIOES = {
    Sudeste: "#e8571a", // Laranja corporativo
    Sul: "#3b82f6", // Azul
    Nordeste: "#10b981", // Verde
    "Centro-Oeste": "#f5a623", // Amarelo/Laranja claro
    Norte: "#8b5cf6", // Roxo
  };

  function desenharGraficoRegioesPizza(contagem) {
    const card = container.querySelector("#regioesCard");
    const canvas = container.querySelector("#regioesCanvas");
    const legenda = container.querySelector("#legendaRegioes");
    const ctx = canvas.getContext("2d");

    const entradas = Object.entries(contagem).sort((a, b) => b[1] - a[1]);
    const total = entradas.reduce((s, [, v]) => s + v, 0);

    if (total === 0) {
      card.style.display = "none";
      return;
    }
    card.style.display = "block";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 10;
    const rInterno = r * 0.42;

    let angulo = -Math.PI / 2;

    entradas.forEach(([regiao, qtd]) => {
      const fatia = (qtd / total) * 2 * Math.PI;
      const cor = CORES_REGIOES[regiao] || "#9ca3af";

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angulo, angulo + fatia);
      ctx.closePath();
      ctx.fillStyle = cor;
      ctx.fill();

      // Borda fina
      ctx.strokeStyle = "#f7f7f8";
      ctx.lineWidth = 2;
      ctx.stroke();

      angulo += fatia;
    });

    // Furo central
    ctx.beginPath();
    ctx.arc(cx, cy, rInterno, 0, 2 * Math.PI);
    ctx.fillStyle = "#f7f7f8";
    ctx.fill();

    // Texto central
    ctx.fillStyle = "#111111";
    ctx.font = `bold ${Math.round(r * 0.28)}px Sora, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total, cx, cy - 6);
    ctx.font = `${Math.round(r * 0.14)}px DM Sans, sans-serif`;
    ctx.fillStyle = "#888";
    ctx.fillText("denúncias", cx, cy + 13);

    // Legenda
    legenda.innerHTML = "";
    entradas.forEach(([regiao, qtd]) => {
      const pct = ((qtd / total) * 100).toFixed(0);
      const li = document.createElement("li");
      li.className = "legenda-item";
      li.innerHTML = `
        <span class="legenda-cor" style="background:${CORES_REGIOES[regiao] || "#9ca3af"}"></span>
        <span class="legenda-nome">${regiao}</span>
        <span class="legenda-pct">${pct}% (${qtd})</span>
      `;
      legenda.appendChild(li);
    });
  }

  // ── Denúncias ─────────────────────────────────────────────────────────
  let todasAsDenuncias = [];

  async function carregarDenuncias() {
    const lista = container.querySelector("#listaDenuncias");

    lista.innerHTML = `
      <div class="skeleton"></div>
      <div class="skeleton"></div>
      <div class="skeleton"></div>
    `;

    try {
      // por_pagina=100 garante dados completos para o gráfico
      const response = await fetch(
        "https://truecall.onrender.com/api/denuncias?por_pagina=100",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const json = await response.json();
      // Compatível tanto com a resposta paginada {dados:[]} quanto array direto
      const denuncias = Array.isArray(json) ? json : (json.dados ?? []);
      todasAsDenuncias = denuncias;
      lista.innerHTML = "";

      // ── Gráfico ───────────────────────────────────────────────────
      const contagem = {};
      denuncias.forEach((d) => {
        contagem[d.tipo_golpe] = (contagem[d.tipo_golpe] || 0) + 1;
      });
      desenharGraficoPizza(contagem);

      // ── Distribuição Geográfica por Região (Pizza) ────────────────────
      const MAPA_REGIOES = {
        SP: "Sudeste",
        RJ: "Sudeste",
        MG: "Sudeste",
        ES: "Sudeste",
        PR: "Sul",
        SC: "Sul",
        RS: "Sul",
        BA: "Nordeste",
        PE: "Nordeste",
        CE: "Nordeste",
        RN: "Nordeste",
        PB: "Nordeste",
        AL: "Nordeste",
        SE: "Nordeste",
        PI: "Nordeste",
        MA: "Nordeste",
        DF: "Centro-Oeste",
        GO: "Centro-Oeste",
        MT: "Centro-Oeste",
        MS: "Centro-Oeste",
        AM: "Norte",
        PA: "Norte",
        RO: "Norte",
        RR: "Norte",
        AC: "Norte",
        TO: "Norte",
        AP: "Norte",
      };

      const contagemRegioes = {};
      denuncias.forEach((d) => {
        if (d.estado) {
          const regiao = MAPA_REGIOES[d.estado.toUpperCase()];
          if (regiao) {
            contagemRegioes[regiao] = (contagemRegioes[regiao] || 0) + 1;
          }
        }
      });

      desenharGraficoRegioesPizza(contagemRegioes);

      if (denuncias.length === 0) {
        lista.innerHTML = `
          <div class="empty-state">
            <p>Nenhuma denúncia registrada ainda.</p>
          </div>
        `;
        return;
      }

      denuncias.forEach((d) => {
        const nomeInstituicao =
          d.instituicao === "Outro" && d.instituicao_personalizada
            ? d.instituicao_personalizada
            : d.instituicao;

        const nomeTipoGolpe =
          d.tipo_golpe === "Outro" && d.tipo_golpe_personalizado
            ? d.tipo_golpe_personalizado
            : d.tipo_golpe;

        lista.innerHTML += `
          <div class="cardDenuncia">
            <div class="card-header-linha">
              <h3>${d.telefone}</h3>
              <span class="badge-tipo">${nomeTipoGolpe}</span>
            </div>
            <div class="card-meta">
              <span><strong>Instituição:</strong> ${nomeInstituicao}</span>
              <span><strong>Tipo:</strong> ${nomeTipoGolpe}</span>
              ${d.estado ? `<span><strong>Estado:</strong> ${d.estado}</span>` : ""}
            </div>
            <p class="card-descricao">${d.descricao}</p>
            <div class="card-acoes">
              <button class="btnEditar btn-editar-card" data-id="${d.id}">Editar</button>
              <button class="btnExcluir btn-excluir-card" data-id="${d.id}">Excluir</button>
            </div>
          </div>
        `;
      });

      lista.querySelectorAll(".btnEditar").forEach((btn) => {
        btn.addEventListener("click", () => {
          abrirModalEditar(btn.dataset.id);
        });
      });

      lista.querySelectorAll(".btnExcluir").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!confirm("Excluir denúncia?")) return;
          await fetch(
            `https://truecall-sistemas-distribuidos-e-mobile-1.onrender.com/api/denuncias/${btn.dataset.id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            },
          );
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

  // Lógica de exportar denúncias para CSV
  container.querySelector("#btnExportar").addEventListener("click", () => {
    if (todasAsDenuncias.length === 0) {
      alert("Não há denúncias registradas para exportar.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Telefone,Tipo de Golpe,Instituição,Descrição,Estado,Data\n";

    todasAsDenuncias.forEach((d) => {
      const instituicao =
        d.instituicao === "Outro" && d.instituicao_personalizada
          ? d.instituicao_personalizada
          : d.instituicao;

      const tel = d.telefone.replace(/"/g, '""');
      const tipo = d.tipo_golpe.replace(/"/g, '""');
      const inst = instituicao.replace(/"/g, '""');
      const desc = d.descricao.replace(/\n/g, " ").replace(/"/g, '""');
      const est = (d.estado || "").replace(/"/g, '""');
      const data = d.data_denuncia;

      csvContent += `"${tel}","${tipo}","${inst}","${desc}","${est}","${data}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "blacklist_truecall.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  carregarDenuncias();
  return container;
};
