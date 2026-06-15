export function desenharDonut(canvas, legendaEl, entradas, coresMap, opts = {}) {
  const ctx = canvas.getContext("2d");
  const total = entradas.reduce((s, [, v]) => s + v, 0);

  if (total === 0) return false;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = Math.min(cx, cy) - 10;
  const rInterno = r * 0.42;

  let angulo = -Math.PI / 2;

  entradas.forEach(([label, qtd], i) => {
    const fatia = (qtd / total) * 2 * Math.PI;
    const cor =
      typeof coresMap === "function"
        ? coresMap(label, i)
        : coresMap[label] || "#9ca3af";

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angulo, angulo + fatia);
    ctx.closePath();
    ctx.fillStyle = cor;
    ctx.fill();

    ctx.strokeStyle = "#f7f7f8";
    ctx.lineWidth = 2;
    ctx.stroke();

    angulo += fatia;
  });

  // Central hole
  ctx.beginPath();
  ctx.arc(cx, cy, rInterno, 0, 2 * Math.PI);
  ctx.fillStyle = "#f7f7f8";
  ctx.fill();

  // Central text
  ctx.fillStyle = "#111111";
  ctx.font = `bold ${Math.round(r * 0.28)}px Sora, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(total, cx, cy - 6);
  ctx.font = `${Math.round(r * 0.14)}px DM Sans, sans-serif`;
  ctx.fillStyle = "#888";
  ctx.fillText(opts.centerLabel || "denúncias", cx, cy + 13);

  // Legend
  legendaEl.innerHTML = "";
  entradas.forEach(([label, qtd], i) => {
    const pct = ((qtd / total) * 100).toFixed(0);
    const cor =
      typeof coresMap === "function"
        ? coresMap(label, i)
        : coresMap[label] || "#9ca3af";
    const li = document.createElement("li");
    li.className = "legenda-item";
    const extra = opts.showCount ? ` (${qtd})` : "";
    li.innerHTML = `
      <span class="legenda-cor" style="background:${cor}"></span>
      <span class="legenda-nome">${label}</span>
      <span class="legenda-pct">${pct}%${extra}</span>
    `;
    legendaEl.appendChild(li);
  });

  return true;
}
