

  document.addEventListener('DOMContentLoaded', function () {
    const sino = document.getElementById('icone-sino');
    const popup = document.getElementById('popup-notificacoes');
    const lista = document.getElementById('lista-notificacoes');

    // Alternar visibilidade do pop-up
    sino.addEventListener('click', () => {
      popup.classList.toggle('ativo');
    });

    // Carregar JSON
    fetch('../notificacoes.json')
      .then(res => res.json())
      .then(data => {
       data.forEach(n => {
  const li = document.createElement('li');
  li.innerHTML = `<strong>${n.data}:</strong> ${n.mensagem}`;
  lista.appendChild(li);
        });
      })
      .catch(erro => {
        console.error("Erro ao carregar notificações:", erro);
        lista.innerHTML = '<li>Erro ao carregar notificações.</li>';
      });
  });

