export function aplicarMascaraTelefone(valor) {
  let num = valor.replace(/\D/g, "");

  if (num.startsWith("0800")) {
    if (num.length > 11) num = num.slice(0, 11);
    if (num.length <= 4) return num;
    if (num.length <= 7) return `${num.slice(0, 4)} ${num.slice(4)}`;
    return `${num.slice(0, 4)} ${num.slice(4, 7)} ${num.slice(7)}`;
  }

  if (num.startsWith("4004") || num.startsWith("3003")) {
    if (num.length > 8) num = num.slice(0, 8);
    if (num.length <= 4) return num;
    return `${num.slice(0, 4)}-${num.slice(4)}`;
  }

  const ehCelular = num.length >= 3 && num[2] === "9";
  const limite = ehCelular ? 11 : 10;
  if (num.length > limite) num = num.slice(0, limite);

  if (num.length === 0) return "";
  if (num.length <= 2) return `(${num}`;
  if (num.length <= 6) return `(${num.slice(0, 2)}) ${num.slice(2)}`;
  if (num.length <= 10)
    return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`;
  return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`;
}

export function obterTamanhoEsperadoTelefone(telefoneLimpo) {
  const ehCelular = telefoneLimpo.length >= 3 && telefoneLimpo[2] === "9";
  return { ehCelular, tamanhoEsperado: ehCelular ? 11 : 10 };
}
