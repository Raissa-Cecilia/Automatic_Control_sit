document.addEventListener('DOMContentLoaded', function() {
    // Verificar se é usuário premium (simulação)
    const isPremiumUser = false; // Alterar para true para testar versão premium
    
    // Elementos DOM
    const stockChartCanvas = document.getElementById('stockChart');
    const dateRangeSelect = document.getElementById('dateRange');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const productCategorySelect = document.getElementById('productCategory');
    const chartTypeSelect = document.getElementById('chartType');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const saveChartBtn = document.getElementById('saveChartBtn');
    const newChartBtn = document.getElementById('newChartBtn');
    const confirmSaveChartBtn = document.getElementById('confirmSaveChartBtn');
    const upgradeBtn = document.getElementById('upgradeBtn');
    const confirmUpgradeBtn = document.getElementById('confirmUpgradeBtn');
    const savedChartsTable = document.getElementById('savedChartsTable');
    const totalEntriesElement = document.getElementById('totalEntries');
    const totalExitsElement = document.getElementById('totalExits');
    const netBalanceElement = document.getElementById('netBalance');
    const premiumAlert = document.getElementById('premiumAlert');
    
    // Variáveis globais
    let stockChart;
    let savedCharts = JSON.parse(localStorage.getItem('savedCharts')) || [];
    
    // Configurar datas iniciais
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    startDateInput.valueAsDate = oneMonthAgo;
    endDateInput.valueAsDate = today;
    
    // Configurar opções para usuários não premium
    if (!isPremiumUser) {
        dateRangeSelect.value = 'daily';
        monthlyOption.disabled = true;
        yearlyOption.disabled = true;
        premiumAlert.style.display = 'block';
    } else {
        premiumAlert.style.display = 'none';
    }
    
    // Dados mockados para o gráfico
    function generateMockData(dateRange, category) {
        const data = {
            labels: [],
            entries: [],
            exits: []
        };
        
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        
        if (dateRange === 'daily') {
            // Gerar dados diários
            const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
            
            for (let i = 0; i <= daysDiff; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i);
                
                data.labels.push(currentDate.toLocaleDateString());
                data.entries.push(Math.floor(Math.random() * 50) + 10);
                data.exits.push(Math.floor(Math.random() * 40) + 5);
            }
        } else if (dateRange === 'monthly') {
            // Gerar dados mensais
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth();
            const endYear = endDate.getFullYear();
            const endMonth = endDate.getMonth();
            
            for (let year = startYear; year <= endYear; year++) {
                const monthStart = (year === startYear) ? startMonth : 0;
                const monthEnd = (year === endYear) ? endMonth : 11;
                
                for (let month = monthStart; month <= monthEnd; month++) {
                    data.labels.push(new Date(year, month, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
                    data.entries.push(Math.floor(Math.random() * 200) + 50);
                    data.exits.push(Math.floor(Math.random() * 180) + 40);
                }
            }
        } else if (dateRange === 'yearly') {
            // Gerar dados anuais
            const startYear = startDate.getFullYear();
            const endYear = endDate.getFullYear();
            
            for (let year = startYear; year <= endYear; year++) {
                data.labels.push(year.toString());
                data.entries.push(Math.floor(Math.random() * 1000) + 300);
                data.exits.push(Math.floor(Math.random() * 900) + 250);
            }
        }
        
        // Ajustar valores baseado na categoria selecionada
        if (category !== 'all') {
            const categoryFactor = parseInt(category) / 6; // Fator baseado no ID da categoria
            data.entries = data.entries.map(value => Math.floor(value * (0.5 + categoryFactor)));
            data.exits = data.exits.map(value => Math.floor(value * (0.5 + categoryFactor)));
        }
        
        return data;
    }
    
    // Atualizar resumo
    function updateSummary(data) {
        const totalEntries = data.entries.reduce((a, b) => a + b, 0);
        const totalExits = data.exits.reduce((a, b) => a + b, 0);
        const netBalance = totalEntries - totalExits;
        
        totalEntriesElement.textContent = totalEntries;
        totalExitsElement.textContent = totalExits;
        netBalanceElement.textContent = netBalance;
    }
    
    // Criar/atualizar gráfico
    function updateChart() {
        const dateRange = dateRangeSelect.value;
        const category = productCategorySelect.value;
        const chartType = chartTypeSelect.value;
        
        const data = generateMockData(dateRange, category);
        updateSummary(data);
        
        if (stockChart) {
            stockChart.destroy();
        }
        
        const ctx = stockChartCanvas.getContext('2d');
        stockChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Entradas',
                        data: data.entries,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1,
                        fill: true
                    },
                    {
                        label: 'Saídas',
                        data: data.exits,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        tension: 0.1,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Movimentação de Estoque - ${productCategorySelect.options[productCategorySelect.selectedIndex].text}`,
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantidade'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
    
    // Carregar gráficos salvos
    function loadSavedCharts() {
        savedChartsTable.innerHTML = '';
        
        if (savedCharts.length === 0) {
            savedChartsTable.innerHTML = '<tr><td colspan="6" class="text-center py-4">Nenhum gráfico salvo ainda</td></tr>';
            return;
        }
        
        savedCharts.forEach((chart, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${chart.name}</td>
                <td>${chart.chartType === 'line' ? 'Linha' : 'Barras'}</td>
                <td>${chart.dateRange === 'daily' ? 'Diário' : chart.dateRange === 'monthly' ? 'Mensal' : 'Anual'}</td>
                <td>${chart.category === 'all' ? 'Todas' : productCategorySelect.options[parseInt(chart.category)].text}</td>
                <td>${new Date(chart.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-chart-btn" data-id="${index}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary edit-chart-btn" data-id="${index}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-chart-btn" data-id="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            savedChartsTable.appendChild(row);
        });
        
        // Adicionar event listeners aos botões
        document.querySelectorAll('.view-chart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const chartId = parseInt(this.getAttribute('data-id'));
                loadChart(chartId);
            });
        });
        
        document.querySelectorAll('.edit-chart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const chartId = parseInt(this.getAttribute('data-id'));
                editChart(chartId);
            });
        });
        
        document.querySelectorAll('.delete-chart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const chartId = parseInt(this.getAttribute('data-id'));
                deleteChart(chartId);
            });
        });
    }

    // Função para editar um gráfico salvo
    function editChart(chartId) {
        const chart = savedCharts[chartId];
        
        // Preencher o modal com os dados existentes
        document.getElementById('chartName').value = chart.name;
        document.getElementById('chartDescription').value = chart.description || '';
        
        // Alterar o título do modal e o comportamento do botão salvar
        document.getElementById('saveChartModalLabel').textContent = 'Editar Gráfico';
        
        const saveModal = new bootstrap.Modal(document.getElementById('saveChartModal'));
        saveModal.show();
        
        // Substituir o event listener temporariamente para edição
        const oldListener = document.getElementById('confirmSaveChartBtn').onclick;
        document.getElementById('confirmSaveChartBtn').onclick = function() {
            const chartName = document.getElementById('chartName').value;
            const chartDescription = document.getElementById('chartDescription').value;
            
            if (!chartName) {
                alert('Por favor, insira um nome para o gráfico.');
                return;
            }
            
            // Atualizar o gráfico existente
            savedCharts[chartId].name = chartName;
            savedCharts[chartId].description = chartDescription;
            localStorage.setItem('savedCharts', JSON.stringify(savedCharts));
            
            // Restaurar o modal ao estado original
            document.getElementById('saveChartModalLabel').textContent = 'Salvar Gráfico';
            document.getElementById('chartName').value = '';
            document.getElementById('chartDescription').value = '';
            
            // Restaurar o event listener original
            document.getElementById('confirmSaveChartBtn').onclick = oldListener;
            
            saveModal.hide();
            loadSavedCharts();
        };
    }
    
    // Carregar um gráfico salvo
    function loadChart(chartId) {
        const chart = savedCharts[chartId];
        
        dateRangeSelect.value = chart.dateRange;
        startDateInput.value = chart.startDate;
        endDateInput.value = chart.endDate;
        productCategorySelect.value = chart.category;
        chartTypeSelect.value = chart.chartType;
        
        updateChart();
    }
    
    // Excluir um gráfico salvo
    function deleteChart(chartId) {
        if (confirm('Tem certeza que deseja excluir este gráfico salvo?')) {
            savedCharts.splice(chartId, 1);
            localStorage.setItem('savedCharts', JSON.stringify(savedCharts));
            loadSavedCharts();
        }
    }
    
    // Salvar gráfico atual
    function saveCurrentChart(chartName, chartDescription) {
        const newChart = {
            name: chartName,
            description: chartDescription || '',
            dateRange: dateRangeSelect.value,
            startDate: startDateInput.value,
            endDate: endDateInput.value,
            category: productCategorySelect.value,
            chartType: chartTypeSelect.value,
            createdAt: new Date().toISOString()
        };
        
        savedCharts.push(newChart);
        localStorage.setItem('savedCharts', JSON.stringify(savedCharts));
        
        loadSavedCharts();
    }
    
    // Event Listeners
    applyFiltersBtn.addEventListener('click', function() {
        if (dateRangeSelect.value === 'monthly' || dateRangeSelect.value === 'yearly') {
            if (!isPremiumUser) {
                alert('Este recurso está disponível apenas na versão Premium. Atualize sua conta para acessar.');
                dateRangeSelect.value = 'daily';
                return;
            }
        }
        updateChart();
    });
    
    resetFiltersBtn.addEventListener('click', function() {
        dateRangeSelect.value = 'daily';
        startDateInput.valueAsDate = oneMonthAgo;
        endDateInput.valueAsDate = today;
        productCategorySelect.value = 'all';
        chartTypeSelect.value = 'line';
        updateChart();
    });
    
    saveChartBtn.addEventListener('click', function() {
        if (!isPremiumUser && savedCharts.length >= 5) {
            alert('Você atingiu o limite de gráficos salvos na versão gratuita. Atualize para Premium para salvar mais gráficos.');
            return;
        }
        
        // O modal será aberto automaticamente pelo data-bs-toggle
    });
    
    confirmSaveChartBtn.addEventListener('click', function() {
        const chartName = document.getElementById('chartName').value;
        const chartDescription = document.getElementById('chartDescription').value;
        
        if (!chartName) {
            alert('Por favor, insira um nome para o gráfico.');
            return;
        }
        
        saveCurrentChart(chartName, chartDescription);
        
        // Fechar modal e limpar formulário
        const modal = bootstrap.Modal.getInstance(document.getElementById('saveChartModal'));
        modal.hide();
        document.getElementById('chartName').value = '';
        document.getElementById('chartDescription').value = '';
    });
    
    upgradeBtn.addEventListener('click', function() {
        const upgradeModal = new bootstrap.Modal(document.getElementById('upgradeModal'));
        upgradeModal.show();
    });
    
    confirmUpgradeBtn.addEventListener('click', function() {
        alert('Redirecionando para página de pagamento...');
        // Em uma aplicação real, aqui você redirecionaria para a página de pagamento
        const upgradeModal = bootstrap.Modal.getInstance(document.getElementById('upgradeModal'));
        upgradeModal.hide();
    });
    
    // Inicialização
    updateChart();
    loadSavedCharts();
    
    // Verificar e desabilitar opções premium se não for usuário premium
    if (!isPremiumUser) {
        dateRangeSelect.addEventListener('change', function() {
            if (this.value === 'monthly' || this.value === 'yearly') {
                alert('Este recurso está disponível apenas na versão Premium. Atualize sua conta para acessar.');
                this.value = 'daily';
            }
        });
    }
});