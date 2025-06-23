document.addEventListener('DOMContentLoaded', function() {
  // Carrega os dados do usuário logado
  const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
  
  if (!usuarioLogado) {
    window.location.href = "../login/login.html";
    return;
  }

  // Preenche os dados do usuário
  document.getElementById('userName').textContent = usuarioLogado.nome || 'Admin';
  document.getElementById('userEmail').textContent = usuarioLogado.email || 'admin@empresa.com';
  document.getElementById('userType').textContent = usuarioLogado.tipo === 'admin' ? 'Administrador' : 'Funcionário';
  
  // Atualiza a última data de acesso
  const now = new Date();
  document.getElementById('lastAccess').textContent = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR').substring(0, 5);

  // Botão de logout
  document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('usuarioLogado');
    window.location.href = "../login/login.html";
  });

  // Botão para salvar foto
  document.getElementById('savePhotoBtn').addEventListener('click', function() {
    const fileInput = document.getElementById('profilePhotoInput');
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('profilePic').src = e.target.result;
        // Aqui você pode adicionar código para salvar a foto no servidor
        alert('Foto alterada com sucesso!');
        bootstrap.Modal.getInstance(document.getElementById('changePhotoModal')).hide();
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      alert('Selecione uma imagem para alterar sua foto de perfil.');
    }
  });

  // Botão para salvar edições do perfil
  document.getElementById('saveProfileBtn').addEventListener('click', function() {
    const nome = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    const senha = document.getElementById('editPassword').value;
    const confirmSenha = document.getElementById('confirmPassword').value;

    if (!nome || !email) {
      alert('Nome e email são obrigatórios!');
      return;
    }

    if (senha && senha !== confirmSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    // Atualiza os dados na tela
    document.getElementById('userName').textContent = nome;
    document.getElementById('userEmail').textContent = email;

    // Aqui você pode adicionar código para salvar no servidor
    if (senha) {
      alert('Perfil e senha alterados com sucesso!');
    } else {
      alert('Perfil alterado com sucesso!');
    }

    bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
  });

  // Carrega os dados no modal de edição
  document.getElementById('editProfileModal').addEventListener('show.bs.modal', function() {
    document.getElementById('editName').value = usuarioLogado.nome || 'Admin';
    document.getElementById('editEmail').value = usuarioLogado.email || 'admin@empresa.com';
  });
});