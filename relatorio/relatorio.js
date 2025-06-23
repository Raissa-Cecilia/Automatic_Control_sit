
const produtos = [
  { codigo: "001", nome: "Dipirona", estoque: 12, minimo: 10, fabricacao: "2024-02-10", vencimento: "2025-02-10" },
  { codigo: "002", nome: "Paracetamol", estoque: 8, minimo: 10, fabricacao: "2024-01-15", vencimento: "2025-01-15" },
  { codigo: "003", nome: "Amoxicilina", estoque: 25, minimo: 10, fabricacao: "2023-12-01", vencimento: "2025-06-01" }
];
function carregarTabela() {
  const corpoTabela = document.querySelector("#tabela-produtos tbody");
  const totalSpan = document.querySelector("#total-produtos");
  corpoTabela.innerHTML = "";
  let total = 0;
  produtos.forEach(p => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${p.codigo}</td>
      <td>${p.nome}</td>
      <td>${p.estoque}</td>
      <td>${p.minimo}</td>
      <td>${p.fabricacao}</td>
      <td>${p.vencimento}</td>
      <td>
        <button>✏️</button>
        <button>🗑️</button>
      </td>`;
    corpoTabela.appendChild(linha);
    total++;
  });
  totalSpan.textContent = total;
}
document.addEventListener("DOMContentLoaded", carregarTabela);
