/**
 * AJAX registration
 */
$(document).ready(function() {
    $('#registerForm').on('submit', function(event) {
        event.preventDefault();

        const $form = $(this);
        const $submitBtn = $('#submitButton');

        // Prevent double submissions by disabling submit button
        $submitBtn.prop('disabled', true);

        $.ajax({
            url: '/register',
            type: 'POST',
            data: $form.serialize(),
            dataType: 'json',
            success: function(url) {
                window.location.href = url;
            },
            error: function(xhr) {
                const errorMessage = xhr.responseText;
                
                $('#registerResponse').text(errorMessage).show();
                $submitBtn.prop('disabled', false);
            }

        })
    })
})