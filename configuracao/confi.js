document.addEventListener('DOMContentLoaded', function() {
      const opcoesCor = document.querySelectorAll('.opcao-cor-tema');
      opcoesCor.forEach(opcao => {
        opcao.addEventListener('click', function() {
          const grupo = this.getAttribute('data-cor');
          document.querySelectorAll(`.opcao-cor-tema[data-cor="${grupo}"]`).forEach(el => {
            el.classList.remove('ativa');
          });
    
          this.classList.add('ativa');
        });
      });
      
      document.getElementById('botao-salvar-configuracoes').addEventListener('click', function() {
        alert('Configurações salvas com sucesso!');
      });
    });