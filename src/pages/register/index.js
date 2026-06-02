```javascript
export default () => {

  const container = document.createElement('div');

  container.innerHTML = `
    <form class="logContainer">

      <h2>Criar Conta</h2>

      <input
        type="text"
        id="nome"
        placeholder="Nome"
      >

      <input
        type="email"
        id="email"
        placeholder="Email"
      >

      <input
        type="password"
        id="senha"
        placeholder="Senha"
      >

      <button id="btnCadastrar">
        Cadastrar
      </button>

      <p id="message"></p>

    </form>
  `;

  const btn =
    container.querySelector('#btnCadastrar');

  const msg =
    container.querySelector('#message');

  btn.addEventListener('click', async (e) => {

    e.preventDefault();

    try {

      const response = await fetch(
        'http://localhost:5000/api/auth/registrar',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: container.querySelector('#nome').value,
            email: container.querySelector('#email').value,
            senha: container.querySelector('#senha').value,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro);
      }

      msg.innerHTML =
        'Cadastro realizado com sucesso';

      setTimeout(() => {
        window.location.hash = '#login';
      }, 1500);

    } catch (error) {

      msg.innerHTML = error.message;
    }
  });

  return container;
};
