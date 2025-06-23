
let mensagemAtualId = null;
let mensagemEditandoId = null;

function verificarAdmin() {
  const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
  return usuarioLogado && usuarioLogado.tipo === 'admin';
}

function enviarMensagemUsuario(texto) {
  const input = document.getElementById('mensagemInput');
  const msg = input.value.trim();
  if (!msg) return;

  const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
  const usuarioAtual = usuarioLogado ? usuarioLogado.email : 'visitante';
  
  fetch("http://localhost:3000/mensagens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario: usuarioAtual,
      mensagem: msg,
      respostaAdmin: ""
    })
  })
  .then(res => res.json())
  .then(() => {
    carregarMensagensUsuario();
    if (verificarAdmin()) {
      carregarMensagensParaAdmin();
    }
    input.value = '';
  });
}

function carregarMensagensUsuario() {
  fetch("http://localhost:3000/mensagens")
    .then(res => res.json())
    .then(mensagens => {
      const chat = document.getElementById("chatUsuario");
      chat.innerHTML = "";
      
      const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
      const usuarioAtual = usuarioLogado ? usuarioLogado.email : 'visitante';
      const mensagensUsuario = mensagens.filter(msg => msg.usuario === usuarioAtual);
      
      if (mensagensUsuario.length === 0) {
        chat.innerHTML = '<div class="text-muted">Nenhuma mensagem encontrada.</div>';
        return;
      }
      
      mensagensUsuario.forEach(msg => {
        const dataMsg = msg.data ? new Date(msg.data) : new Date();
        const mensagemElement = `
          <div class="mensagem-usuario mb-2 p-2 bg-light rounded">
            <div class="dropdown mensagem-acoes">
              <button class="btn btn-sm btn-link text-muted" type="button" data-bs-toggle="dropdown">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" onclick="editarMensagem('${msg.id}')"><i class="fas fa-edit me-2"></i>Editar</a></li>
                <li><a class="dropdown-item" href="#" onclick="excluirMensagem('${msg.id}')"><i class="fas fa-trash me-2"></i>Excluir</a></li>
              </ul>
            </div>
            <strong>Você:</strong> ${msg.mensagem}
            <small class="d-block text-muted">${dataMsg.toLocaleString()}</small>
          </div>
          ${msg.respostaAdmin ? `
            <div class="mensagem-admin mb-3 p-2 bg-primary text-white rounded">
              <strong>Suporte:</strong> ${msg.respostaAdmin}
              <small class="d-block text-white-50">${dataMsg.toLocaleString()}</small>
            </div>
          ` : ""}
        `;
        chat.innerHTML += mensagemElement;
      });
      chat.scrollTop = chat.scrollHeight;
    });
}

function carregarMensagensParaAdmin() {
  if (!verificarAdmin()) return;

  fetch("http://localhost:3000/mensagens")
    .then(res => res.json())
    .then(mensagens => {
      const adminArea = document.getElementById("painelAdmin");
      adminArea.innerHTML = "";
      
      if (mensagens.length === 0) {
        adminArea.innerHTML = '<div class="text-muted">Nenhuma mensagem de usuários.</div>';
        return;
      }
      
      mensagens.forEach(msg => {
        const dataMsg = msg.data ? new Date(msg.data) : new Date();
        adminArea.innerHTML += `
          <div class="mensagem-admin-item mb-3 p-3 border rounded">
            <div class="d-flex justify-content-between">
              <strong>${msg.usuario}:</strong>
              <small class="text-muted">${dataMsg.toLocaleString()}</small>
            </div>
            <div class="mb-2">${msg.mensagem}</div>
            <div class="resposta-admin p-2 mb-2 ${msg.respostaAdmin ? 'bg-light' : 'bg-warning bg-opacity-10'}">
              <strong>Resposta:</strong> ${msg.respostaAdmin || "Sem resposta ainda"}
            </div>
            <button class="btn btn-sm ${msg.respostaAdmin ? 'btn-outline-primary' : 'btn-primary'}" 
                    onclick="responderMensagem('${msg.id}', '${msg.usuario}')">
              <i class="fas ${msg.respostaAdmin ? 'fa-edit' : 'fa-reply'}"></i>
              ${msg.respostaAdmin ? ' Editar Resposta' : ' Responder'}
            </button>
            <hr class="my-2">
          </div>
        `;
      });
    });
}

function responderMensagem(id, usuario) {
  if (!verificarAdmin()) {
    alert('Acesso restrito a administradores!');
    return;
  }

  mensagemAtualId = id;
  const modal = new bootstrap.Modal(document.getElementById('modalResposta'));
  document.querySelector('#modalResposta .modal-title').textContent = `Responder para ${usuario}`;
  
  fetch(`http://localhost:3000/mensagens/${id}`)
    .then(res => res.json())
    .then(msg => {
      document.getElementById('respostaTexto').value = msg.respostaAdmin || '';
      modal.show();
    });
}

function enviarResposta() {
  if (!verificarAdmin()) {
    alert('Acesso restrito a administradores!');
    return;
  }

  const resposta = document.getElementById('respostaTexto').value.trim();
  if (resposta && mensagemAtualId) {
    fetch(`http://localhost:3000/mensagens/${mensagemAtualId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respostaAdmin: resposta })
    })
    .then(() => {
      carregarMensagensParaAdmin();
      carregarMensagensUsuario();
      bootstrap.Modal.getInstance(document.getElementById('modalResposta')).hide();
      document.getElementById('respostaTexto').value = '';
      mensagemAtualId = null;
    });
  }
}

function editarMensagem(id) {
  mensagemEditandoId = id;
  fetch(`http://localhost:3000/mensagens/${id}`)
    .then(res => res.json())
    .then(msg => {
      document.getElementById('editarTexto').value = msg.mensagem;
      const modal = new bootstrap.Modal(document.getElementById('modalEditar'));
      modal.show();
    });
}

function salvarEdicao() {
  const novaMensagem = document.getElementById('editarTexto').value.trim();
  if (novaMensagem && mensagemEditandoId) {
    fetch(`http://localhost:3000/mensagens/${mensagemEditandoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem: novaMensagem })
    })
    .then(() => {
      carregarMensagensUsuario();
      if (verificarAdmin()) {
        carregarMensagensParaAdmin();
      }
      bootstrap.Modal.getInstance(document.getElementById('modalEditar')).hide();
      document.getElementById('editarTexto').value = '';
      mensagemEditandoId = null;
    });
  }
}

function excluirMensagem(id) {
  if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
    fetch(`http://localhost:3000/mensagens/${id}`, {
      method: "DELETE"
    })
    .then(() => {
      carregarMensagensUsuario();
      if (verificarAdmin()) {
        carregarMensagensParaAdmin();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
  if (!usuarioLogado) {
    window.location.href = 'login.html';
    return;
  }

  carregarMensagensUsuario();
  if (verificarAdmin()) {
    carregarMensagensParaAdmin();
  }
  
  document.getElementById('mensagemInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      enviarMensagemUsuario(this.value);
      this.value = '';
    }
  });
});