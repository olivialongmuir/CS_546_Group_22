(function () {
  const profileForm = document.getElementById('profile-form');
  const formError = document.getElementById('form-error');

  if (profileForm) {
    profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      formError.hidden = true;
      formError.textContent = '';

      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const emailAddress = document.getElementById('email').value.trim();

      // Validation
      if (!firstName) {
        formError.textContent = 'First name is required.';
        formError.hidden = false;
        document.getElementById('firstName').focus();
        return;
      }

      if (!lastName) {
        formError.textContent = 'Last name is required.';
        formError.hidden = false;
        document.getElementById('lastName').focus();
        return;
      }

      if (!emailAddress) {
        formError.textContent = 'Email address is required.';
        formError.hidden = false;
        document.getElementById('email').focus();
        return;
      }

      try {
        const response = await fetch('/profile/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firstName,
            lastName,
            emailAddress
          })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error);
        }

        alert('Profile updated successfully!');

      } catch (err) {
        formError.textContent = err.message;
        formError.hidden = false;
      }
    });
  }
})();
