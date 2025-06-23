
    document.addEventListener('DOMContentLoaded', function() {
      // Inicializa o localStorage se não existir
      if (!localStorage.getItem("produtos")) {
        localStorage.setItem("produtos", JSON.stringify([]));
      }
      
      // Controle dos filtros avançados
      const botaoFiltros = document.getElementById('botao-filtros');
      const filtroAvancado = document.getElementById('filtro-avancado');
      
      botaoFiltros.addEventListener('click', function() {
        filtroAvancado.classList.toggle('mostrar');
        if (filtroAvancado.classList.contains('mostrar')) {
          this.innerHTML = '<i class="fas fa-times me-1"></i> Fechar Filtros';
        } else {
          this.innerHTML = '<i class="fas fa-sliders-h me-1"></i> Filtros Avançados';
        }
      });
      
      // Carrega todos os produtos inicialmente
      carregarProdutos();
      
      // Configura o evento de pesquisa
      document.getElementById('botao-pesquisar').addEventListener('click', function() {
        const termo = document.getElementById('campo-busca').value.trim();
        carregarProdutos(termo);
      });
    });
    
    // Função para carregar produtos (com opção de filtro)
    function carregarProdutos(termoBusca = '') {
      const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
      const container = document.getElementById('resultados-pesquisa');
      
      // Aplicar filtro se houver termo de busca
      const produtosFiltrados = termoBusca 
        ? produtos.filter(produto => 
            produto.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            (produto.codigo && produto.codigo.includes(termoBusca)) ||
            produto.categoria.toLowerCase().includes(termoBusca.toLowerCase())
          )
        : produtos;
      
      if (produtosFiltrados.length === 0) {
        const mensagem = termoBusca
          ? `Nenhum resultado para "${termoBusca}"`
          : 'Nenhum produto cadastrado';
        
        container.innerHTML = `
          <div class="col-12">
            <div class="sem-resultados">
              <i class="fas fa-${termoBusca ? 'search' : 'box-open'} fa-3x mb-3"></i>
              <h4>${mensagem}</h4>
              <p class="text-muted">${termoBusca ? 'Tente outro termo de busca' : 'Adicione seu primeiro produto'}</p>
            </div>
          </div>
        `;
        return;
      }
      
      // Gerar HTML dos produtos
      let html = '';
      produtosFiltrados.forEach((produto, indice) => {
        // Verificar status do produto baseado na data de validade
        let status = '';
        let badge = '';
        
        if (produto.dataVencimento) {
          const dataValidade = new Date(produto.dataVencimento);
          const hoje = new Date();
          const diffTime = dataValidade - hoje;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) {
            status = 'Vencido';
            badge = '<span class="badge bg-danger badge-vencimento">Vencido</span>';
          } else if (diffDays <= 7) {
            status = 'Próximo do vencimento';
            badge = '<span class="badge bg-warning text-dark badge-vencimento">Vence em ' + diffDays + ' dias</span>';
          } else {
            status = 'Ativo';
          }
        }
        
        html += `
          <div class="col-md-6 col-lg-4">
            <div class="card card-produto h-100">
              ${badge}
              ${produto.imagens && produto.imagens[0] 
                ? `<img src="${produto.imagens[0]}" class="card-img-top imagem-produto" alt="${produto.nome}">` 
                : `<div class="d-flex align-items-center justify-content-center bg-light" style="height: 180px;">
                    <i class="fas fa-box-open fa-3x text-muted"></i>
                  </div>`}
              <div class="card-body">
                <h5 class="card-title">${produto.nome || 'Produto sem nome'}</h5>
                <p class="card-text text-muted mb-1">
                  <small>Código: ${produto.codigo || 'N/A'}</small>
                </p>
                <p class="card-text mb-1">
                  <span class="badge bg-secondary">${produto.categoria || 'Sem categoria'}</span>
                  <span class="badge bg-info text-dark ms-1">${produto.tipo || 'Sem tipo'}</span>
                </p>
                <p class="card-text">
                  <small class="text-muted">Validade: ${produto.dataVencimento ? new Date(produto.dataVencimento).toLocaleDateString('pt-BR') : 'Não informada'}</small>
                </p>
              </div>
              <div class="card-footer bg-white border-top-0">
                <a href="../cadastro/cadastroP.html?edit=${indice}" class="btn btn-sm btn-outline-primary me-1">
                  <i class="fas fa-edit"></i> Editar
                </a>
                <button class="btn btn-sm btn-outline-danger botao-excluir" data-id="${indice}">
                  <i class="fas fa-trash-alt"></i> Excluir
                </button>
              </div>
            </div>
          </div>
        `;
      });
      
      container.innerHTML = html;
      
      // Adicionar eventos aos botões de excluir
      document.querySelectorAll('.botao-excluir').forEach(botao => {
        botao.addEventListener('click', function() {
          const id = parseInt(this.getAttribute('data-id'));
          excluirProduto(id);
        });
      });
    }
    
    // Função para excluir produto
    function excluirProduto(indice) {
      if (confirm('Tem certeza que deseja excluir este produto?')) {
        const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
        produtos.splice(indice, 1);
        localStorage.setItem("produtos", JSON.stringify(produtos));
        carregarProdutos(document.getElementById('campo-busca').value.trim());
      }
    }