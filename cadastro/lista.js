function inicializarProdutosPadrao() {
    const produtosPadrao = [
        {
            codigo: '7891000142005',
            nome: 'Leite Integral 1L',
            categoria: 'Laticínios',
            tipo: 'Alimento',
            dataFabricacao: '2023-11-01',
            dataVencimento: '2023-12-30',
            imagens: []
        },
        {
            codigo: '7891910000197',
            nome: 'Arroz Branco 5kg',
            categoria: 'Grãos',
            tipo: 'Alimento',
            dataFabricacao: '2023-10-15',
            dataVencimento: '2024-10-15',
            imagens: []
        },
        {
            codigo: '7896094999995',
            nome: 'Analgésico 500mg',
            categoria: 'Medicamentos',
            tipo: 'Medicamento',
            dataFabricacao: '2023-09-01',
            dataVencimento: '2025-09-01',
            imagens: []
        }
    ];

    if (true) {
        localStorage.setItem("produtos", JSON.stringify(produtosPadrao));
    }
}
document.addEventListener('DOMContentLoaded', function() {
    inicializarProdutosPadrao(); // Adiciona produtos iniciais se necessário
    carregarProdutos(); // Carrega os produtos para exibição
});

async function buscarInformacoesProduto(codigoBarras) {
    try {
        const resposta = await fetch(`https://world.openfoodfacts.org/api/v0/product/${codigoBarras}.json`);
        const dados = await resposta.json();
        
        if (dados.status === 1) {
            return {
                nome: dados.product.product_name || 'Nome não disponível',
                marca: dados.product.brands || 'Marca não disponível',
                categoria: dados.product.categories || 'Categoria não disponível',
                imagem: dados.product.image_url || null,
                nutriScore: dados.product.nutrition_grades || null,
                ingredientes: dados.product.ingredients_text || 'Ingredientes não disponíveis'
            };
        }
        return null;
    } catch (erro) {
        console.error('Erro ao buscar informações do produto:', erro);
        return null;
    }
}

async function carregarProdutos() {
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    const container = document.getElementById("lista-produtos");
    
    if (produtos.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open fa-4x text-muted mb-3"></i>
                <h3 class="text-muted">Nenhum produto registrado</h3>
                <p class="text-muted">Adicione seu primeiro produto clicando em "Novo Produto"</p>
            </div>
        `;
        return;
    }
    
    const produtosComInfo = await Promise.all(produtos.map(async (produto, indice) => {
        if (produto.codigo && /^\d{8,13}$/.test(produto.codigo)) {
            const infoAPI = await buscarInformacoesProduto(produto.codigo);
            return { ...produto, infoAPI };
        }
        return produto;
    }));
    
    container.innerHTML = produtosComInfo.map((produto, indice) => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 shadow-sm">
                ${produto.imagens && produto.imagens[0] ? 
                    `<img src="${produto.imagens[0]}" class="card-img-top" alt="${produto.nome}" style="height: 200px; object-fit: cover;">` : 
                    produto.infoAPI && produto.infoAPI.imagem ?
                    `<img src="${produto.infoAPI.imagem}" class="card-img-top" alt="${produto.nome}" style="height: 200px; object-fit: cover;">` :
                    `<div class="d-flex align-items-center justify-content-center bg-light" style="height: 200px;">
                        <i class="fas fa-box-open fa-3x text-muted"></i>
                    </div>`}
                <div class="card-body">
                    <h5 class="card-title">${produto.nome || (produto.infoAPI ? produto.infoAPI.nome : 'Produto sem nome')}</h5>
                    <div class="mb-2"><small><strong>Código:</strong> ${produto.codigo || 'N/A'}</small></div>
                    <div class="mb-2"><small><strong>Categoria:</strong> ${produto.categoria || (produto.infoAPI ? produto.infoAPI.categoria : 'Não especificada')}</small></div>
                    ${produto.infoAPI && produto.infoAPI.marca ? `<div class="mb-2"><small><strong>Marca:</strong> ${produto.infoAPI.marca}</small></div>` : ''}
                    <div class="mb-2"><small><strong>Validade:</strong> ${produto.dataVencimento || 'Não especificada'}</small></div>
                    ${produto.infoAPI && produto.infoAPI.nutriScore ? `
                        <div class="mt-2">
                            <small><strong>Nutri-Score:</strong> 
                                <span class="nutri-score nutri-score-${produto.infoAPI.nutriScore.toLowerCase()}">
                                    ${produto.infoAPI.nutriScore.toUpperCase()}
                                </span>
                            </small>
                        </div>
                    ` : ''}
                </div>
                <div class="card-footer bg-white">
                    <a href="cadastroP.html?edit=${indice}" class="btn btn-sm btn-outline-primary me-2">
                        <i class="fas fa-edit"></i> Editar
                    </a>
                    <button onclick="excluirProduto(${indice})" class="btn btn-sm btn-outline-danger">
                        <i class="fas fa-trash-alt"></i> Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function excluirProduto(indice) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
        produtos.splice(indice, 1);
        localStorage.setItem("produtos", JSON.stringify(produtos));
        carregarProdutos();
    }
}

function exportarDados() {
    const dados = localStorage.getItem("produtos");
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'backup-produtos.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

function importarDados(evento) {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;
    
    const leitor = new FileReader();
    leitor.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            if (Array.isArray(dados)) {
                localStorage.setItem("produtos", JSON.stringify(dados));
                carregarProdutos();
                alert('Dados importados com sucesso!');
            } else {
                alert('O arquivo não contém dados válidos.');
            }
        } catch (erro) {
            alert('Erro ao ler o arquivo: ' + erro.message);
        }
    };
    leitor.readAsText(arquivo);
}

function voltarPara() {
    window.location.href = "index.html"; // Altere para a página inicial do seu sistema
}