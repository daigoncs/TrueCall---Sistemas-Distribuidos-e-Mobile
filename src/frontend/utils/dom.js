import { fetchApi } from "./api.js";

export function resolverNomeOutro(nomePadrao, nomePersonalizado) {
  if (nomePadrao === "Outro" && nomePersonalizado) return nomePersonalizado;
  return nomePadrao;
}

export async function popularSelect(endpoint, selectElement) {
  try {
    const response = await fetchApi(endpoint);
    const dados = await response.json();
    selectElement.innerHTML =
      '<option value="">Selecionar...</option>' +
      dados
        .map((item) => `<option value="${item.id}">${item.nome}</option>`)
        .join("");
  } catch (err) {
    console.error(`Erro ao carregar ${endpoint}:`, err);
  }
}

export function monitorarSelecaoOutro(container, selectElement, wrapperId) {
  selectElement.addEventListener("change", () => {
    const textoSelecionado =
      selectElement.options[selectElement.selectedIndex]?.text.toLowerCase();
    container.querySelector(wrapperId).style.display =
      textoSelecionado === "outro" ? "block" : "none";
  });
}
