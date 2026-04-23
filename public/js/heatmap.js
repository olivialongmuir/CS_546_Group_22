// global variables
let map;
let heat;
let searchInput;
let searchButton;
let autocompleteList;
const zoomThreshold = 16;
const rodentMarkers = L.layerGroup();
const restaurantMarkers = {};

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

// dynamic way to show rodent markers when zoomed in beyond thresh
function updateLayers() {
    const zoom = map.getZoom();
    if (zoom >= zoomThreshold) {
        if (!map.hasLayer(rodentMarkers)) map.addLayer(rodentMarkers);
    } else {
        if (map.hasLayer(rodentMarkers)) map.removeLayer(rodentMarkers);
    }
}

// search bar functionality
function searchRestaurant() {
    const query = searchInput.value.trim().toLowerCase();
    const marker = restaurantMarkers[query];
    // zoom + center map on input and open popup
    map.setView(marker.getLatLng(), 17);
    marker.openPopup();
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

    // grab search bar elements
    searchInput = document.getElementById("searchInput");
    searchButton = document.getElementById("searchButton");
    autocompleteList = document.getElementById("autocompleteList");

    // restaurant markers
    if (typeof restaurantMapData !== 'undefined') {
        restaurantMapData.forEach(restaurant => {
            const marker = L.marker([restaurant.lat, restaurant.lng], { icon: restaurantPin })
                .addTo(map)
                .bindPopup(`
                    <div style="text-align:center;">
                        <a href="/restaurants/${restaurant._id}" class="popup-link">
                            ${restaurant.name}
                        </a>
                    </div>
                `);
            // store marker
            restaurantMarkers[restaurant.name.toLowerCase()] = marker;
        });
    };

    if (typeof rodentMapData !== 'undefined') {
        // markers
        rodentMapData.forEach(r => {
            const marker = L.marker([Number(r.lat), Number(r.lng)], { icon: ratPin })
            // TODO - add link to rodent report details similar to restaurant above
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
    };

    // dynamic zoom
    map.on('zoomend', updateLayers);
    updateLayers();

    // event listeners for search bar (button click or enter)
    searchButton.addEventListener("click", searchRestaurant);
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            searchRestaurant();
        }
    });
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        autocompleteList.innerHTML = "";
        if (!query) return;
        const matches = restaurantMapData
            .filter(r => r.name.toLowerCase().includes(query))
            .slice(0, 6); // limit results
        matches.forEach(r => {
            const item = document.createElement("div");
            item.classList.add("autocomplete-item");
            item.textContent = r.name;
            item.addEventListener("click", () => {
                const marker = restaurantMarkers[r.name.toLowerCase()];
                // fly map to the marker
                if (marker) {
                    map.flyTo(marker.getLatLng(), 17);
                    marker.openPopup();
                }
                searchInput.value = r.name;
                autocompleteList.innerHTML = "";
            });
            autocompleteList.appendChild(item);
        });
    });
    document.addEventListener("click", (e) => {
        if (!document.getElementById("searchBarContainer").contains(e.target)) {
            autocompleteList.innerHTML = "";
        }
    });

    setTimeout(() => {
        map.invalidateSize(true);
    }, 0);
});