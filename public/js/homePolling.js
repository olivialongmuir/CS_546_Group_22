/**
 * Polling home page statistics
 */
$(document).ready(function() {
    function updateHomeStats() {
        $.ajax({
            url: '/api/home-data',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                const fieldMap = {
                    '#homeTotalRestaurants': response.totalRestaurants,
                    '#homeTotalReports': response.totalReports,
                    '#homeTotalUsers': response.totalUsers,
                    '#homeVerifiedSightings': response.totalVerified
                }

                // Adds a fade effect so it is more noticeable
                Object.keys(fieldMap).forEach(id => {
                    updateField(id, fieldMap[id]);
                })
            },
            error: function(xhr) {
                console.error("Unable to refresh home statistics: ", xhr.status);
            },
            complete: function() {
                setTimeout(updateHomeStats, 60000); // Once every minute
            }
        });
    }

    setTimeout(updateHomeStats, 60000); // Adds a delay to first call. Redundant to call it immediately
});

// Helper: Fades field if changed
const updateField = (selector, newVal) => {
    const $sel = $(selector);
    const curVal = $sel.text()?.trim();

    if (String(newVal) !== curVal) {
        $sel.fadeOut(200, function() {
            $(this.text(newVal).fadeIn(200));
        })
    }
};