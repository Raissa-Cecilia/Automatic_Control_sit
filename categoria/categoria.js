document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const categoriesGrid = document.getElementById('categoriesGrid');
    const productsPanel = document.getElementById('productsPanel');
    const productsGrid = document.getElementById('productsGrid');
    const backButton = document.querySelector('.back-button');
    const currentCategoryName = document.getElementById('current-category-name');
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const addProductBtn = document.getElementById('addProductBtn');
    const exitCategoryBtn = document.getElementById('exitCategoryBtn');

    // Novos elementos DOM
    const addCategoryForm = document.getElementById('addCategoryForm');
    const addItemForm = document.getElementById('addItemForm');
    const newCategoryForm = document.getElementById('newCategoryForm');
    const newItemForm = document.getElementById('newItemForm');
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
    const cancelItemBtn = document.getElementById('cancelItemBtn');
    
    // Elementos dos modais
    const categoryModal = document.getElementById('categoryModal');
    const confirmModal = document.getElementById('confirmModal');
    const productModal = document.getElementById('productModal');
    const confirmProductModal = document.getElementById('confirmProductModal');
    
    // Formulários
    const categoryForm = document.getElementById('categoryForm');
    const productForm = document.getElementById('productForm');
    
    // Dados
    let categoriesData = JSON.parse(localStorage.getItem('categoriesData')) || {
        categorias: [
            {
                id: 1,
                nome: "Alimentos",
                icon: "fa-utensils",
                produtos: []
            },
            {
                id: 2,
                nome: "Bem-Estar e Estética",
                icon: "fa-spa",
                produtos: []
            },
            {
                id: 3,
                nome: "Cuidados com a Pele",
                icon: "fa-soap",
                produtos: []
            },
            {
                id: 4,
                nome: "Higiene Pessoal",
                icon: "fa-shower",
                produtos: [
                    {codigo: 8001, nome: "Sabonete Líquido", descricao: "Sabonete líquido para higiene pessoal"},
                    {codigo: 8002, nome: "Shampoo", descricao: "Shampoo para cabelos normais"},
                    {codigo: 8003, nome: "Condicionador", descricao: "Condicionador para cabelos secos"},
                    {codigo: 8004, nome: "Creme Dental", descricao: "Creme dental com flúor"},
                    {codigo: 8005, nome: "Escova de Dentes", descricao: "Escova de dentes macia"}
                ]
            },
            {
                id: 5,
                nome: "Medicamentos",
                icon: "fa-pills",
                produtos: [
                    {codigo: 9001, nome: "Analgésico Forte", descricao: "Uso controlado sob prescrição médica"},
                    {codigo: 9002, nome: "Ansiolítico", descricao: "Controlado - receita azul"},
                    {codigo: 9003, nome: "Antidepressivo", descricao: "Uso controlado"}
                ]
            },
            {
                id: 6,
                nome: "Primeiros Socorros",
                icon: "fa-first-aid",
                produtos: [
                    {codigo: 7001, nome: "Álcool", descricao: "Descrição do produto Álcool"},
                    {codigo: 7002, nome: "Água-Oxigenada Vol., 10", descricao: "Descrição do produto Água-Oxigenada"},
                    {codigo: 7003, nome: "Analgésico", descricao: "Descrição do produto Analgésico"},
                    {codigo: 7004, nome: "Band-Aid", descricao: "Descrição do produto Band-Aid"},
                    {codigo: 7005, nome: "Curativos", descricao: "Descrição do produto Curativos"}
                ]
            }
        ]
    };

    // Funções principais
    function saveData() {
        localStorage.setItem('categoriesData', JSON.stringify(categoriesData));
    }

    function loadCategories() {
        categoriesGrid.innerHTML = '';
        categoriesData.categorias.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.dataset.categoryId = category.id;
            
            categoryCard.innerHTML = `
                <div class="category-actions">
                    <button class="edit-btn" data-id="${category.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-id="${category.id}"><i class="fas fa-trash"></i></button>
                </div>
                <div class="category-icon">
                    <i class="fas ${category.icon || 'fa-box'}"></i>
                </div>
                <h3 class="category-name">${category.nome}</h3>
                <span class="products-count">${category.produtos.length} produtos</span>
            `;
            
            categoryCard.addEventListener('click', (e) => {
                if (!e.target.closest('.category-actions')) {
                    showProducts(category);
                }
            });
            
            categoriesGrid.appendChild(categoryCard);
        });

        // Adiciona eventos aos botões
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editCategory(parseInt(btn.dataset.id));
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                confirmDelete(parseInt(btn.dataset.id));
            });
        });
    }

    function showProducts(category) {
        productsGrid.innerHTML = '';
        currentCategoryName.textContent = category.nome;
        addProductBtn.dataset.categoryId = category.id;
        
        // Mostra o botão de adicionar item e sair
        addProductBtn.style.display = 'flex';
        exitCategoryBtn.style.display = 'flex';
        
        if (category.produtos.length === 0) {
            productsGrid.innerHTML = '<p class="no-products">Nenhum produto cadastrado nesta categoria.</p>';
        } else {
            category.produtos.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                
                const controladoBadge = category.id === 5 ? '<span class="controlado-badge">CONTROLADO</span>' : '';
                
                productCard.innerHTML = `
                    <div class="product-header">
                        <h4>${product.nome}${controladoBadge}</h4>
                        <p class="product-code">Código: ${product.codigo}</p>
                    </div>
                    <p class="product-description">${product.descricao}</p>
                    <div class="product-actions">
                        <button class="edit-product-btn" data-id="${product.codigo}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="delete-product-btn" data-id="${product.codigo}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                `;
                productsGrid.appendChild(productCard);
            });
            
            // Adiciona eventos aos botões de produtos
            document.querySelectorAll('.edit-product-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    editProduct(category.id, parseInt(btn.dataset.id));
                });
            });
            
            document.querySelectorAll('.delete-product-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    confirmProductDelete(category.id, parseInt(btn.dataset.id));
                });
            });
        }
        
        categoriesGrid.parentElement.classList.add('hidden');
        productsPanel.classList.remove('hidden');
    }

    // Event Listeners
    backButton.addEventListener('click', () => {
        productsPanel.classList.add('hidden');
        categoriesGrid.parentElement.classList.remove('hidden');
    });

    exitCategoryBtn.addEventListener('click', () => {
        productsPanel.classList.add('hidden');
        categoriesGrid.parentElement.classList.remove('hidden');
    });

    cancelItemBtn.addEventListener('click', function() {
        addItemForm.style.display = 'none';
        productsGrid.classList.remove('hidden');
    });

    addCategoryBtn.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Adicionar Nova Categoria';
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryIcon').value = '';
        categoryModal.style.display = 'flex';
    });

    addProductBtn.addEventListener('click', () => {
        const categoryId = parseInt(addProductBtn.dataset.categoryId);
        document.getElementById('productModalTitle').textContent = 'Adicionar Novo Produto';
        document.getElementById('productId').value = '';
        document.getElementById('productCategoryId').value = categoryId;
        document.getElementById('productCode').value = '';
        document.getElementById('productName').value = '';
        document.getElementById('productDescription').value = '';
        productModal.style.display = 'flex';
    });

    // Funções CRUD para categorias
    function editCategory(id) {
        const category = categoriesData.categorias.find(c => c.id === id);
        if (category) {
            document.getElementById('modalTitle').textContent = 'Editar Categoria';
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.nome;
            document.getElementById('categoryIcon').value = category.icon || '';
            categoryModal.style.display = 'flex';
        }
    }

    function confirmDelete(id) {
        const category = categoriesData.categorias.find(c => c.id === id);
        if (category) {
            document.getElementById('categoryToDeleteName').textContent = category.nome;
            document.getElementById('confirmDeleteBtn').dataset.id = id;
            confirmModal.style.display = 'flex';
        }
    }

    function deleteCategory(id) {
        categoriesData.categorias = categoriesData.categorias.filter(c => c.id !== id);
        saveData();
        loadCategories();
        confirmModal.style.display = 'none';
    }

    // Funções CRUD para produtos
    function editProduct(categoryId, productCode) {
        const category = categoriesData.categorias.find(c => c.id === categoryId);
        if (category) {
            const product = category.produtos.find(p => p.codigo === productCode);
            if (product) {
                document.getElementById('productModalTitle').textContent = 'Editar Produto';
                document.getElementById('productId').value = productCode;
                document.getElementById('productCategoryId').value = categoryId;
                document.getElementById('productCode').value = product.codigo;
                document.getElementById('productName').value = product.nome;
                document.getElementById('productDescription').value = product.descricao;
                productModal.style.display = 'flex';
            }
        }
    }

    function confirmProductDelete(categoryId, productCode) {
        const category = categoriesData.categorias.find(c => c.id === categoryId);
        if (category) {
            const product = category.produtos.find(p => p.codigo === productCode);
            if (product) {
                document.getElementById('productToDeleteName').textContent = product.nome;
                document.getElementById('confirmProductDeleteBtn').dataset.categoryId = categoryId;
                document.getElementById('confirmProductDeleteBtn').dataset.productCode = productCode;
                confirmProductModal.style.display = 'flex';
            }
        }
    }

    function deleteProduct(categoryId, productCode) {
        const category = categoriesData.categorias.find(c => c.id === categoryId);
        if (category) {
            category.produtos = category.produtos.filter(p => p.codigo !== productCode);
            saveData();
            showProducts(category);
            confirmProductModal.style.display = 'none';
        }
    }

    // Submit handlers
    categoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('categoryId').value ? parseInt(document.getElementById('categoryId').value) : Math.max(...categoriesData.categorias.map(c => c.id)) + 1;
        const name = document.getElementById('categoryName').value.trim();
        const icon = document.getElementById('categoryIcon').value.trim();
        
        if (!name) {
            alert('O nome da categoria é obrigatório!');
            return;
        }
        
        const existingIndex = categoriesData.categorias.findIndex(c => c.id === id);
        
        if (existingIndex >= 0) {
            categoriesData.categorias[existingIndex] = {
                ...categoriesData.categorias[existingIndex],
                nome: name,
                icon: icon
            };
        } else {
            categoriesData.categorias.push({
                id: id,
                nome: name,
                icon: icon,
                produtos: []
            });
        }
        
        saveData();
        loadCategories();
        categoryModal.style.display = 'none';
    });

    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const categoryId = parseInt(document.getElementById('productCategoryId').value);
        const productCode = document.getElementById('productCode').value ? parseInt(document.getElementById('productCode').value) : 
            (categoriesData.categorias.find(c => c.id === categoryId)?.produtos.length > 0 ? 
            Math.max(...categoriesData.categorias.find(c => c.id === categoryId).produtos.map(p => p.codigo)) + 1 : 1000);
        const name = document.getElementById('productName').value.trim();
        const description = document.getElementById('productDescription').value.trim();
        
        if (!name || !productCode) {
            alert('O nome e código do produto são obrigatórios!');
            return;
        }
        
        const category = categoriesData.categorias.find(c => c.id === categoryId);
        if (category) {
            const existingIndex = category.produtos.findIndex(p => p.codigo === productCode);
            
            if (existingIndex >= 0) {
                category.produtos[existingIndex] = {
                    ...category.produtos[existingIndex],
                    nome: name,
                    descricao: description
                };
            } else {
                category.produtos.push({
                    codigo: productCode,
                    nome: name,
                    descricao: description
                });
            }
            
            saveData();
            showProducts(category);
            productModal.style.display = 'none';
        }
    });

    // Fechar modais
    document.querySelectorAll('.close-btn, .btn-secondary').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });

    // Confirmar exclusões
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        deleteCategory(parseInt(this.dataset.id));
    });

    document.getElementById('confirmProductDeleteBtn').addEventListener('click', function() {
        deleteProduct(parseInt(this.dataset.categoryId), parseInt(this.dataset.productCode));
    });

    // Pesquisa
    searchButton.addEventListener('click', filterCategories);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') filterCategories();
    });

    function filterCategories() {
        const term = searchInput.value.toLowerCase();
        document.querySelectorAll('.category-card').forEach(card => {
            const name = card.querySelector('.category-name').textContent.toLowerCase();
            card.style.display = name.includes(term) ? 'flex' : 'none';
        });
    }

    // Modifique o event listener do addCategoryBtn para usar o novo formulário
    addCategoryBtn.addEventListener('click', () => {
        document.querySelector('.form-title').textContent = 'Adicionar Nova Categoria';
        document.getElementById('newCategoryName').value = '';
        document.getElementById('newCategoryIcon').value = '';
        addCategoryForm.style.display = 'block';
        // Esconde os outros painéis
        categoriesGrid.parentElement.classList.add('hidden');
        productsPanel.classList.add('hidden');
    });

    // Modifique o event listener do addProductBtn para usar o novo formulário
    addProductBtn.addEventListener('click', () => {
        const categoryId = parseInt(addProductBtn.dataset.categoryId);
        const category = categoriesData.categorias.find(c => c.id === categoryId);
        
        if (category) {
            document.querySelector('#addItemForm .form-title').textContent = 'Adicionar Novo Item';
            document.getElementById('currentCategoryName').textContent = category.nome;
            document.getElementById('newItemName').value = '';
            document.getElementById('newItemCode').value = '';
            document.getElementById('newItemDescription').value = '';
            document.getElementById('newItemControlled').checked = category.id === 5; // Medicamentos são controlados
            
            addItemForm.style.display = 'block';
            productsGrid.classList.add('hidden');
        }
    });

    // Adicione event listeners para os novos formulários
    newCategoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('newCategoryName').value.trim();
        const icon = document.getElementById('newCategoryIcon').value.trim();
        const id = Math.max(...categoriesData.categorias.map(c => c.id)) + 1;
        
        if (!name) {
            alert('O nome da categoria é obrigatório!');
            return;
        }
        
        categoriesData.categorias.push({
            id: id,
            nome: name,
            icon: icon,
            produtos: []
        });
        
        saveData();
        loadCategories();
        addCategoryForm.style.display = 'none';
        categoriesGrid.parentElement.classList.remove('hidden');
    });

    newItemForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const categoryId = parseInt(addProductBtn.dataset.categoryId);
        const category = categoriesData.categorias.find(c => c.id === categoryId);
        
        if (category) {
            const name = document.getElementById('newItemName').value.trim();
            const code = document.getElementById('newItemCode').value.trim();
            const description = document.getElementById('newItemDescription').value.trim();
            const isControlled = document.getElementById('newItemControlled').checked;
            
            if (!name) {
                alert('O nome do produto é obrigatório!');
                return;
            }
            
            const productCode = code ? parseInt(code) : 
                (category.produtos.length > 0 ? 
                Math.max(...category.produtos.map(p => p.codigo)) + 1 : 1000);
            
            category.produtos.push({
                codigo: productCode,
                nome: name,
                descricao: description,
                controlado: isControlled
            });
            
            saveData();
            showProducts(category);
            addItemForm.style.display = 'none';
            productsGrid.classList.remove('hidden');
        }
    });

    // Adicione event listeners para os botões de cancelar
    cancelCategoryBtn.addEventListener('click', function() {
        addCategoryForm.style.display = 'none';
        categoriesGrid.parentElement.classList.remove('hidden');
    });

    cancelItemBtn.addEventListener('click', function() {
        addItemForm.style.display = 'none';
        productsGrid.classList.remove('hidden');
    });

    // Adicione event listeners para fechar os formulários com o botão X
    document.querySelectorAll('#addCategoryForm .close-btn, #addItemForm .close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const form = this.closest('.add-category-form, .add-item-form');
            if (form) {
                form.style.display = 'none';
                if (form.id === 'addCategoryForm') {
                    categoriesGrid.parentElement.classList.remove('hidden');
                } else {
                    productsGrid.classList.remove('hidden');
                }
            }
        });
    });

    // Modifique a função showProducts para esconder os formulários quando mostrar os produtos
    const originalShowProducts = showProducts;
    showProducts = function(category) {
        addCategoryForm.style.display = 'none';
        addItemForm.style.display = 'none';
        originalShowProducts.call(this, category);
    };

    // Inicialização
    loadCategories();
});