const relatorio = {
  dados: [{
    "totalProdutos": 438,
    "valorTotal": 5800,
    "itenTotais": 10400,
    "produtosCritico": 8,
    "foradeEstoque": 3,
    "ultimaEntrada": {
      "data": "15/04/2025",
      "produto": "Energetico Monster"
    },
    "ultimaSaída": {
      "data": "16/04/2025",
      "produto": "Salgadinho doritos"
    }
  }]
};

function renderizar() {
  const container = document.getElementById('relatorios-container');
  container.innerHTML = '';

  relatorio.dados.forEach(item => {
    const col = document.createElement('div');
    col.className = 'col relatorio-card';

    col.innerHTML = `
      <h5><strong>Relatório Geral</strong></h5>
      <p><strong>Total de Produtos:</strong> ${item.totalProdutos}</p>
      <p><strong>Valor Total em Estoque:</strong> R$ ${item.valorTotal.toFixed(2)}</p>
      <p><strong>Itens Totais:</strong> ${item.itenTotais}</p>
      <p><strong>Produtos em Crítico:</strong> ${item.produtosCritico}</p>
      <p><strong>Fora de Estoque:</strong> ${item.foradeEstoque}</p>
      <p><strong>Última Entrada:</strong> ${item.ultimaEntrada.data} - ${item.ultimaEntrada.produto}</p>
      <p><strong>Última Saída:</strong> ${item.ultimaSaída.data} - ${item.ultimaSaída.produto}</p>
    `;

    container.appendChild(col);
  });
}

function gerarGraficos() {
  const barCtx = document.getElementById('barChart').getContext('2d');
  new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'mai', 'jun'],
      datasets: [{
        label: 'Vendas',
        data: [12000, 19000, 7000, 15000, 23000, 18000],
        backgroundColor: ['#022859', '#F2B138']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });

  const pieCtx = document.getElementById('pieChart').getContext('2d');
  new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: ['Alimentos', 'Bebidas', 'Limpeza', 'Medicamentos'],
      datasets: [{
        data: [20, 25,  20, 35],
        backgroundColor: ['#F2B138', '#022859', '#E61C16','#17E61D']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderizar();
  gerarGraficos();
});

