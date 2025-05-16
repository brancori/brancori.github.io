    function login() {
      const user = document.getElementById('username').value;
      const pass = document.getElementById('password').value;
      const error = document.getElementById('errorMsg');

      const validUsers = [
        { user: 'admin', password: '7563918' },
        { user: 'user', password: '1234' }
      ];

      const isValid = validUsers.some(u => u.user === user && u.password === pass);

      if (isValid) {
        window.location.replace('/componentes/admin.html');    
      } else {
        error.textContent = 'Usuario o contraseña incorrectos';
      }
    } 