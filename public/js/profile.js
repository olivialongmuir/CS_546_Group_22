(function () {
  const profileForm = document.getElementById('profile-form');
  const formError = document.getElementById('form-error');

  if (profileForm) {
    profileForm.addEventListener('submit', (event) => {
      event.preventDefault();

      formError.hidden = true;
      formError.textContent = '';

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();

      if (!name) {
        formError.textContent = 'Full name is required.';
        formError.hidden = false;
        document.getElementById('name').focus();
        return;
      }

      if (!email) {
        formError.textContent = 'Email address is required.';
        formError.hidden = false;
        document.getElementById('email').focus();
        return;
      }
    });
  }
})();
