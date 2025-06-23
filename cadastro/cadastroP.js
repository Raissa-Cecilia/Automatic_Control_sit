let indiceEdicao = null;
    let imagensProduto = [null, null];

    document.addEventListener('DOMContentLoaded', function() {
        const parametrosURL = new URLSearchParams(window.location.search);
        indiceEdicao = parametrosURL.get('edit');
        
        if (indiceEdicao !== null) {
            indiceEdicao = parseInt(indiceEdicao);
            carregarProdutoParaEdicao(indiceEdicao);
        }

        configurarUploadImagens();
        
        document.getElementById('botao-buscar-info').addEventListener('click', buscarInformacoesProduto);
    });

    function configurarUploadImagens() {
        document.querySelectorAll('.image-upload-wrapper input[type="file"]').forEach((input, index) => {
            input.addEventListener('change', async function(event) {
                const arquivo = event.target.files[0];
                if (!arquivo) return;
                
                if (!arquivo.type.match('image.*')) {
                    alert('Por favor, selecione um arquivo de imagem válido');
                    return;
                }
                
                if (arquivo.size > 2 * 1024 * 1024) {
                    alert('A imagem deve ter no máximo 2MB');
                    return;
                }
                
                try {
                    const base64 = await converterParaBase64(arquivo);
                    imagensProduto[index] = base64;
                    
                    const preview = document.getElementById(`preview-imagem-${index + 1}`);
                    preview.innerHTML = `<img src="${base64}" class="img-fluid">`;
                    preview.style.display = 'block';
                    
                    document.getElementById(`rotulo-imagem-${index + 1}`).style.display = 'none';
                } catch (erro) {
                    console.error('Erro ao processar imagem:', erro);
                    alert('Erro ao processar imagem');
                }
            });
        });
    }

    function converterParaBase64(arquivo) {
        return new Promise((resolve, reject) => {
            const leitor = new FileReader();
            leitor.readAsDataURL(arquivo);
            leitor.onload = () => resolve(leitor.result);
            leitor.onerror = erro => reject(erro);
        });
    }

    function carregarProdutoParaEdicao(indice) {
        const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
        if (indice >= 0 && indice < produtos.length) {
            const produto = produtos[indice];
            
            document.getElementById('codigo-produto').value = produto.codigo || '';
            document.getElementById('categoria-produto').value = produto.categoria || '';
            document.getElementById('nome-produto').value = produto.nome || '';
            document.getElementById('tipo-produto').value = produto.tipo || 'alimento';
            document.getElementById('data-fabricacao').value = produto.dataFabricacao || '';
            document.getElementById('data-vencimento').value = produto.dataVencimento || '';
            
            if (produto.imagens) {
                produto.imagens.forEach((img, i) => {
                    if (i >= 2) return;
                    imagensProduto[i] = img;
                    const preview = document.getElementById(`preview-imagem-${i + 1}`);
                    preview.innerHTML = `<img src="${img}" class="img-fluid">`;
                    preview.style.display = 'block';
                    document.getElementById(`rotulo-imagem-${i + 1}`).style.display = 'none';
                });
            }
            
            const botao = document.querySelector('.btn-registrar');
            if (botao) botao.textContent = 'Atualizar Produto';
        }
    }

    async function buscarInformacoesProduto() {
        const codigo = document.getElementById('codigo-produto').value.trim();
        const feedback = document.getElementById('feedback-api');
        const tipoProduto = document.getElementById('tipo-produto').value;
        
        if (!/^\d{8,13}$/.test(codigo)) {
            feedback.textContent = 'Código inválido. Digite um código de barras com 8 a 13 dígitos.';
            feedback.className = 'text-danger';
            return;
        }

        feedback.textContent = 'Buscando informações...';
        feedback.className = 'text-info';

        try {
            let infoProduto = null;
            
            if (tipoProduto === 'alimento') {
                infoProduto = await buscarAlimento(codigo);
            } else if (tipoProduto === 'medicamento') {
                infoProduto = await buscarMedicamento(codigo);
            }

            if (infoProduto) {
                preencherCamposComInformacoes(infoProduto);
                feedback.textContent = 'Informações do produto carregadas com sucesso!';
                feedback.className = 'text-success';
            } else {
                feedback.textContent = 'Produto não encontrado na base de dados.';
                feedback.className = 'text-warning';
            }
        } catch (erro) {
            console.error('Erro ao buscar informações:', erro);
            feedback.textContent = 'Erro ao buscar informações. Tente novamente.';
            feedback.className = 'text-danger';
        }
    }

    async function buscarAlimento(codigo) {
        const resposta = await fetch(`https://world.openfoodfacts.org/api/v0/product/${codigo}.json`);
        const dados = await resposta.json();
        
        if (dados.status === 1) {
            return {
                nome: dados.product.product_name,
                categoria: dados.product.categories,
                marca: dados.product.brands,
                imagem: dados.product.image_url,
                ingredientes: dados.product.ingredients_text,
                nutriScore: dados.product.nutrition_grades
            };
        }
        return null;
    }

    async function buscarMedicamento(termo) {
      try {
        const resposta = await fetch(`https://brasilapi.com.br/api/registro/v1/anvisa/medicamentos?nome=${encodeURIComponent(termo)}`);
        const dados = await resposta.json();
        
        if (dados && dados.length > 0) {
          return {
            nome: dados[0].nomeProduto,
            principioAtivo: dados[0].principioAtivo,
            laboratorio: dados[0].razaoSocial,
            tarja: dados[0].tarja || 'Sem tarja'
          };
        }
      } catch (erro) {
        console.error("Erro na busca de medicamento:", erro);
      }
      return null;
    }

    function preencherCamposComInformacoes(infoProduto) {
        if (infoProduto.nome) {
            document.getElementById('nome-produto').value = infoProduto.nome;
        }
        
        if (infoProduto.categoria) {
            document.getElementById('categoria-produto').value = infoProduto.categoria;
        }
        
        if (infoProduto.imagem) {
            carregarImagemDoProduto(infoProduto.imagem);
        }
    }

    async function carregarImagemDoProduto(urlImagem) {
        try {
            const respostaImagem = await fetch(urlImagem);
            const blob = await respostaImagem.blob();
            const base64 = await converterParaBase64(blob);
            
            imagensProduto[0] = base64;
            const preview = document.getElementById('preview-imagem-1');
            preview.innerHTML = `<img src="${base64}" class="img-fluid">`;
            preview.style.display = 'block';
            document.getElementById('rotulo-imagem-1').style.display = 'none';
        } catch (erro) {
            console.error('Erro ao carregar imagem:', erro);
        }
    }

    function salvarProduto() {
        const produto = {
            codigo: document.getElementById('codigo-produto').value,
            categoria: document.getElementById('categoria-produto').value,
            nome: document.getElementById('nome-produto').value,
            tipo: document.getElementById('tipo-produto').value,
            dataFabricacao: document.getElementById('data-fabricacao').value,
            dataVencimento: document.getElementById('data-vencimento').value,
            imagens: imagensProduto.filter(img => img !== null)
        };

        let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

        if (indiceEdicao !== null) {
            produtos[indiceEdicao] = produto;
        } else {
            produtos.push(produto);
        }

        localStorage.setItem("produtos", JSON.stringify(produtos));
        window.location.href = "produtos.html";
    }