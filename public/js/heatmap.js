window.addEventListener('load', () => {

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

    // example heatmap data: [latitude, longitude, intensity]
    // TODO have intensity increase based on number of reports in vicinity
    L.heatLayer([
        [40.7128, -74.0060, 1],
        [40.7138, -74.0050, 0.5],
        [40.7148, -74.0040, 1]
    ], {
        radius: 25,
        blur: 15
    }).addTo(map);

    setTimeout(() => {
        map.invalidateSize(true);
    }, 0);
});