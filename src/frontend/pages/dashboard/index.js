export default () => {
  const container = document.createElement("div");

  container.innerHTML = `
    <div class="dashboard-page">

      <nav class="topbar">
        <span class="topbar-brand">True<span>Call</span></span>
        <button id="logout" class="btn-logout">Sair</button>
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
            <div id="painelAlerta" class="painel-alerta" style="display: none;"></div>
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

    </div>
  `;

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.hash = "#login";
    return container;
  }

  // -- Navegação --
  container.querySelector("#novaDenuncia").addEventListener("click", () => {
    window.location.hash = "#denuncia";
  });

  container.querySelector("#logout").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.hash = "#login";
  });

  // -- Números confiáveis --
  let todosOsNumeros = [];

  function preencherFiltro(numeros) {
    const filtro = container.querySelector("#filtroInstituicao");
    const valorSelecionado = filtro.value;

    const instituicoesUnicas = [...new Set(numeros.map((n) => n.instituicao))].sort();

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
          const deleteResponse = await fetch(`http://localhost:5000/api/instituicoes/confiaveis/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });

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
      const response = await fetch("http://localhost:5000/api/instituicoes/confiaveis", {
        headers: { Authorization: `Bearer ${token}` }
      });

      todosOsNumeros = await response.json();

      const filtro = container.querySelector("#filtroInstituicao");
      preencherFiltro(todosOsNumeros);
      renderizarLinhas(todosOsNumeros, filtro.value);

    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: red;">Erro ao carregar números.</td></tr>`;
      console.error(error);
    }
  }

  container.querySelector("#filtroInstituicao").addEventListener("change", (e) => {
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

  container.querySelector("#btnAdicionarNumero").addEventListener("click", () => {
    modal.style.display = "flex";
    inputInst.value = "";
    inputNum.value = "";
    modalMsg.textContent = "";
    inputInst.focus();
  });

  function fecharModal() {
    modal.style.display = "none";
  }

  container.querySelector("#btnFecharModal").addEventListener("click", fecharModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });

  container.querySelector("#btnSalvarNumero").addEventListener("click", async () => {
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
    if (numeroLimpo.length !== 8 && numeroLimpo.length !== 10 && numeroLimpo.length !== 11) {
      modalMsg.className = "modal-msg error";
      modalMsg.textContent = "Número inválido. Digite um formato válido (celular, fixo, 0800 ou 4004).";
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/instituicoes/confiaveis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ instituicao, numero })
      });

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

  // -- Denúncias --
  let todasAsDenuncias = [];

  async function carregarDenuncias() {
    const lista = container.querySelector("#listaDenuncias");
    const painelAlerta = container.querySelector("#painelAlerta");

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
      todasAsDenuncias = denuncias;
      lista.innerHTML = "";

      // Modus Operandi dinâmico
      if (denuncias.length > 0) {
        const contagem = {};
        denuncias.forEach((d) => {
          contagem[d.tipo_golpe] = (contagem[d.tipo_golpe] || 0) + 1;
        });

        let golpeMaisComum = "";
        let maxOcorrencias = 0;
        for (const [golpe, qtd] of Object.entries(contagem)) {
          if (qtd > maxOcorrencias) {
            maxOcorrencias = qtd;
            golpeMaisComum = golpe;
          }
        }

        painelAlerta.style.display = "block";
        painelAlerta.innerHTML = `
          <strong>Aviso de Segurança:</strong> A abordagem mais relatada em suas denúncias é <strong>${golpeMaisComum}</strong>. Fique atento a contatos simulando esta situação.
        `;
      } else {
        painelAlerta.style.display = "none";
      }

      if (denuncias.length === 0) {
        lista.innerHTML = `
          <div class="empty-state">
            <p>Nenhuma denúncia registrada ainda.</p>
          </div>
        `;
        return;
      }

      denuncias.forEach((d) => {
        const nomeInstituicao = d.instituicao === "Outro" && d.instituicao_personalizada
          ? d.instituicao_personalizada
          : d.instituicao;

        lista.innerHTML += `
          <div class="cardDenuncia">
            <h3>${d.telefone}</h3>
            <span class="badge-tipo">${d.tipo_golpe}</span>
            <div class="card-meta">
              <span><strong>Instituição:</strong> ${nomeInstituicao}</span>
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

  // Lógica de exportar denúncias para CSV
  container.querySelector("#btnExportar").addEventListener("click", () => {
    if (todasAsDenuncias.length === 0) {
      alert("Não há denúncias registradas para exportar.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Telefone,Tipo de Golpe,Instituição,Descrição,Data\n";

    todasAsDenuncias.forEach((d) => {
      const instituicao = d.instituicao === "Outro" && d.instituicao_personalizada
        ? d.instituicao_personalizada
        : d.instituicao;

      const tel = d.telefone.replace(/"/g, '""');
      const tipo = d.tipo_golpe.replace(/"/g, '""');
      const inst = instituicao.replace(/"/g, '""');
      const desc = d.descricao.replace(/\n/g, " ").replace(/"/g, '""');
      const data = d.data_denuncia;

      csvContent += `"${tel}","${tipo}","${inst}","${desc}","${data}"\n`;
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