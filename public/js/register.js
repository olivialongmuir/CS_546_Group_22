import { 
    checkEmail,
    checkFirstName, 
    checkLastName, 
    checkPassword, 
    checkUsername,
    checkUserType
} from "./helpers.js";

/**
 * AJAX registration
 */
$(document).ready(function() {
    $('#registerForm').on('submit', function(event) {
        event.preventDefault();

        const $form = $(this);
        const $submitBtn = $('#submitButton');

        // Prevent double submissions by disabling submit button
        $('#registerResponse').hide();
        $submitBtn.prop('disabled', true);

        // Project requirement - 3 stage validation in client, route, server
        try {
            const validatedFirstName = checkFirstName($('#firstName').val());
            const validatedLastName = checkLastName($('#lastName').val());
            const validatedUsername = checkUsername($('#username').val());
            const validatedEmail = checkEmail($('#emailAddress').val());
            const validatedPassword = checkPassword($('#password').val());
            const validatedType = checkUserType($('#type').val());

            if (validatedPassword !== $('#confirmPassword').val().trim()) throw 'Error: Passwords do not match';
        } catch(error) {
            $('#registerResponse').text(error).show();
            $submitBtn.prop('disabled', false);

            // Clears password fields
            $('#password').val('');
            $('#confirmPassword').val('');

            return;
        }

        $.ajax({
            url: '/api/register-user',
            type: 'POST',
            data: $form.serialize(),
            dataType: 'json',
            success: function(response) {
                // Redirect to url
                window.location.href = response.url;
            },
            error: function(xhr) {
                const errorMessage = xhr.responseText;
                
                $('#registerResponse').text(errorMessage).show();
                $submitBtn.prop('disabled', false);

                // Clears password fields
                $('#password').val('');
                $('#confirmPassword').val('');
            }
        })
    })
})