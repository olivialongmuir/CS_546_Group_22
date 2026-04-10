window.addEventListener('load', () => {
    // set the initial center of the map to New York City
    const nycLatLng = [40.7128, -74.0060];
    // create the boundaries for the map to be in NYC
    var sourthWest = L.latLng(40.4774, -74.2591);
    var northEast = L.latLng(40.9176, -73.7004);
    var bounds = L.latLngBounds(sourthWest, northEast);
    
    // initialize the map with the given boundaries and set the view to NYC
    const map = L.map('heatmap', {
        preferCanvas: true,
        maxBounds: bounds,
        maxBoundsViscosity: 0.0,
        minZoom: 10, // zoom out bounds
        maxZoom: 18 // zoom in bounds
    }).setView(nycLatLng, 12);


    // map layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // restaurant marker examples
    // TODO - replace with actual restaurant data from database
    var restaurants = [
        { name: 'Restaurant A', lat: 40.7128, lng: -74.0060 },
        { name: 'Restaurant B', lat: 40.7138, lng: -74.0050 },
        { name: 'Restaurant C', lat: 40.7148, lng: -74.0040 }
    ];
    restaurants.forEach(restaurant => {
        L.marker([restaurant.lat, restaurant.lng]).addTo(map)
            .bindPopup(restaurant.name)
            // TODO - can have href link to restaurant page with more info
    });

    // example heatmap data: [latitude, longitude, intensity]
    // TODO have intensity increase based on number of reports in vicinity
    // TODO - replace with actual rodent report data from database
    L.heatLayer([
        // sample points
        // leaflet expects data in format [lat, lng, intensity]
        [40.7128, -74.0060, 1],
        [40.7138, -74.0050, 0.5],
        [40.7148, -74.0040, 0.1]
    ], {
        radius: 25,
        blur: 15,
        // adding custom gradient for heat map points
        gradient: {
            0.1: 'blue',
            0.3: 'yellow',
            0.5: 'orange',
            0.7: 'darkorange',
            1.0: 'red'
        }
    }).addTo(map);

    setTimeout(() => {
        map.invalidateSize(true);
    }, 0);
});