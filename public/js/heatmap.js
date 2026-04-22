// restaurant and rodent icons
const restaurantPin = L.icon({
    iconUrl: '/public/images/restaurant_pin.png',
    iconSize: [30, 30],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const ratPin = L.icon({
    iconUrl: '/public/images/rat_pin.png',
    iconSize: [30, 30],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// global variables
let map;
let heat;
const zoomThreshold = 16;
const rodentMarkers = L.layerGroup();

// dynamic way to show rodent markers when zoomed in beyond thresh
function updateLayers() {
    const zoom = map.getZoom();
    if (zoom >= zoomThreshold) {
        if (heat && !map.hasLayer(rodentMarkers)) map.addLayer(rodentMarkers);
    } else {
        if (map.hasLayer(rodentMarkers)) map.removeLayer(rodentMarkers);
    }
}

window.addEventListener('load', () => {
    // set the initial center of the map to New York City
    const nycLatLng = [40.7128, -74.0060];

    // create the boundaries for the map to be in NYC
    var southWest = L.latLng(40.4774, -74.2591);
    var northEast = L.latLng(40.9176, -73.7004);
    var bounds = L.latLngBounds(southWest, northEast);
    
    // initialize the map with the given boundaries and set the view to NYC
    map = L.map('heatmap', {
        preferCanvas: true,
        maxBounds: bounds,
        maxBoundsViscosity: 0.0,
        minZoom: 10, // zoom out bounds
        maxZoom: 18  // zoom in bounds
    }).setView(nycLatLng, 12);

    // map layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // restaurant markers
    if (typeof restaurantMapData !== 'undefined') {
        restaurantMapData.forEach(restaurant => {
            L.marker([restaurant.lat, restaurant.lng], { icon: restaurantPin })
                .addTo(map)
                .bindPopup(restaurant.name);
        });
    }

    if (typeof rodentMapData !== 'undefined') {
        // markers
        rodentMapData.forEach(r => {
            const marker = L.marker([Number(r.lat), Number(r.lng)], { icon: ratPin })
                .bindPopup("Rodent Report");

            // add rodent layer to group
            rodentMarkers.addLayer(marker);
        });

        const heatData = rodentMapData.map(r => ([
            Number(r.lat),
            Number(r.lng),
            1
        ]));

        // heatmap
        heat = L.heatLayer(heatData, {
            radius: 50,
            blur: 15,
            maxZoom: 17,
            gradient: {
                0.1: '#ff4d4d',
                0.5: '#e60000',
                1.0: '#990000'
            }
        });

        // add heatmap
        heat.addTo(map);
    }

    // dynamic zoom
    map.on('zoomend', updateLayers);
    updateLayers(); // run once on load

    setTimeout(() => {
        map.invalidateSize(true);
    }, 0);
});