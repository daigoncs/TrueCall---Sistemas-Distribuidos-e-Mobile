```javascript
export default () => {

  const container = document.createElement('div');

  container.innerHTML = `
    <div class="dashboardContainer">

      <h1>Minhas Denúncias</h1>

      <button id="novaDenuncia">
        Nova Denúncia
      </button>

      <button id="logout">
        Sair
      </button>

      <div id="listaDenuncias"></div>

    </div>
  `;

  const token = localStorage.getItem('token');

  if (!token) {
    window.location.hash = '#login';
    return container;
  }

  const btnNova =
    container.querySelector('#novaDenuncia');

  const btnLogout =
    container.querySelector('#logout');

  btnNova.addEventListener('click', () => {
    window.location.hash = '#denuncia';
  });

  btnLogout.addEventListener('click', () => {

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    window.location.hash = '#login';
  });

  async function carregarDenuncias() {

    try {

      const response = await fetch(
        'http://localhost:5000/api/denuncias',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const denuncias =
        await response.json();

      const lista =
        container.querySelector('#listaDenuncias');

      lista.innerHTML = '';

      denuncias.forEach((d) => {

        lista.innerHTML += `
          <div class="cardDenuncia">

            <h3>${d.telefone}</h3>

            <p>
              <strong>Instituição:</strong>
              ${d.instituicao}
            </p>

            <p>
              <strong>Tipo:</strong>
              ${d.tipo_golpe}
            </p>

            <p>${d.descricao}</p>

            <button
              class="btnExcluir"
              data-id="${d.id}"
            >
              Excluir
            </button>

          </div>
        `;
      });

      const botoesExcluir =
        lista.querySelectorAll('.btnExcluir');

      botoesExcluir.forEach((btn) => {

        btn.addEventListener('click', async () => {

          const id =
            btn.getAttribute('data-id');

          if (!confirm('Excluir denúncia?')) {
            return;
          }

          await fetch(
            `http://localhost:5000/api/denuncias/${id}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          carregarDenuncias();
        });
      });

    } catch (error) {
      console.error(error);
    }
  }

  carregarDenuncias();

  return container;
};