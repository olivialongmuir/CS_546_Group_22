// global variables
let map;
let heat;
let searchInput;
let searchButton;
let autocompleteList;
let activePins = []; //Use as a global tracker for active dropped pins
const rodentMarkers = L.layerGroup();
const restaurantMarkers = {};
const zoomThreshold = 16;
const flyDuration = 3;
let lastLat; //Tracks the last latitude position clicked
let lastLng; //Tracks the last longitude position clicked

// restaurant and rodent icons
const restaurantPin = L.icon({
    iconUrl: '/public/images/restaurant_pin.png',
    iconSize: [30, 30],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const ratPin = L.icon({
    iconUrl: '/public/images/rat_pin_alt.png',
    iconSize: [30, 30],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});


//Generic Location Pin
const locationPin = L.icon({
    iconUrl: '/public/images/location_pin.png',
    iconSize: [40, 40],
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
    if (!marker) return;
    // zoom + center map on input and open popup
    flyToRestaurant(marker);
    marker.openPopup();
}

function flyToRestaurant(marker) {
    // hide heatmap
    if (heat && map.hasLayer(heat)) {
        map.removeLayer(heat);
    }

    map.flyTo(marker.getLatLng(), 17, {
        duration: flyDuration
    });

    // show heatmap
    setTimeout(() => {
        if (heat) heat.addTo(map);
    }, flyDuration * 1000);
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
        maxZoom: 18,  // zoom in bounds
        zoomControl: false // remove zoom controls
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
                    <div class="btn-stack">
                        <a href="/restaurants/${restaurant._id}" class="popup-link">
                        ${restaurant.name}
                        <button class="btn">View Restaurant</button>
                        </a>
                    </div>`
                );
            // store marker
            restaurantMarkers[restaurant.name.toLowerCase()] = marker;
        });
    };

    if (typeof rodentMapData !== 'undefined') {
        // markers
        rodentMapData.forEach(r => {
            const marker = L.marker([Number(r.lat), Number(r.lng)], { icon: ratPin })
            // TODO - add link to rodent report details similar to restaurant above
                .bindPopup(
                        `<div class="btn-stack">
                         <a href="/ratreports/${r._id}" class="popup-link">
                         <button class="btn">View Report</button>
                        </a>
                    </div>`
                );

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


    // right click on the map to then zoom in and display a pop up for the user. 
    //The pop up will contain prompt to make a new report
    map.on('contextmenu', function (e) {

        //clear stale pins
        removePins();

        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        //fly and zoom into that position
        flyToLocation(lat,lng, 17);

        //Drop a temp pin in that location
        addPin(map, lat, lng);

        
        // window.location.href = `/createReport?lat=${lat}&lng=${lng}`;
    });


    //Event listener to remove old pins
    // //removes active pin if user clicked back to map outside of popup 
    map.on('click', function () {
        removePins();
    });
    map.on('popupclose', function () {
        removePins();
    });



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
                    flyToRestaurant(marker);
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




//Flys and zooms to a location from and event click
function flyToLocation(lat,lng, zoom) {
    // hide heatmap
    if (heat && map.hasLayer(heat)) {
        map.removeLayer(heat);
    }

    //make location object
    var latlng = L.latLng(lat, lng);

    map.flyTo(latlng, zoom, {
        duration: 1
    });

    // show heatmap
    setTimeout(() => {
        if (heat) heat.addTo(map);
    }, flyDuration * 1000);
}



//Creates and returns a map HTML stub to use as a popup for pins
const makePopUp=(lat,lng)=>{
            return`
             <div class="infoRow">
                <span class="locationStat">Lat: ${lat}</span>
                <span class="locationStat">Lng: ${lng}</span>
            </div>
            <div class="btn-stack">
            <button class="btn" style="background-color: grey";>Register Restaurant</button>
            <button class="createReportBtn btn">Create Rodent Report</button>
            </div>`
}

//Created and returns an HTML stub for map pop up that can direct user to login or sign up
const loginPopUp=(lat,lng)=>{
            return`
            <div>
                <p style="color: white; text-align: center"
                >Login or Sign Up today to report rodents!</p>
            </div>
            <div class="btn-stack">
                <a href="/register" class="popup-link">
                    <button class="btn" style="background-color: grey">Sign Up</button>
                </a>
                <a href="/login" class="popup-link">
                    <button class="btn">Login</button>
                </a>
            </div>`
}



//Adds a pin marker to a clicked location
const addPin=(map, lat, lng)=>{

    //Set lat long
    lastLat = lat;
    lastLng = lng;

    //Make new pin object
    newPin = L.marker([lat, lng], { icon: locationPin })
        .addTo(map)

    //Checks wether or not the user is logged in. 
    //If user is not logged in the pop up will be generic and promt them to login. Else will be the report creation prompt
    //get current user data

    if(userAuthenticated){
        newPin.bindPopup(makePopUp(lat,lng)); //uses html template
    }else{
        newPin.bindPopup(loginPopUp());
    }

    //Open the pop up for user to see
    newPin.openPopup();

    //Add to pins list
    activePins.push(newPin);
}

//Removes all active pins
const removePins=()=>{
    for(const pin of activePins){
        if (map.hasLayer(pin)) {
            map.removeLayer(pin);
        }
    }
}



//Closes all pin popups
const closePopUps=()=>{
    for(const pin of activePins){
        pin.closePopUp()
    }
}


//Hides the create report popup
document.getElementById("cancelSubmit")?.addEventListener('click', ()=>{

    //get the pop up form to show
    let popUp = document.getElementById("reportPopUp");
    const mapLayout = document.getElementById("heatmapLayout");

    if(popUp){
        popUp.style.visibility = '';
        mapLayout.style.visibility = 'visible';
    }

    //Flys the user back to  map
    flyToLocation(lastLat, lastLng, 16);

})


//Opens the create report popup
document.addEventListener('click', (e) => {
    //listens for clicks on the entire page

    //if the click occured on a create report button class then this function will fire
    const btn = e.target.closest('.createReportBtn');
    if (!btn) return;

    //get the pop up
    const popUp = document.getElementById("reportPopUp");
    const mapLayout = document.getElementById("heatmapLayout");

    //Populate the lat and long pill buttons
    document.getElementById("latStat").innerText = `Lat: ${lastLat}`;
    document.getElementById("lngStat").innerText = `Lng: ${lastLng}`;

    //Prepopulate the forms fiedls with user info and location
    document.getElementById("latitude").value = lastLat;
    document.getElementById("longitude").value = lastLng;


    //now set visbility of all elements
    if(popUp){
        //show pop up
        popUp.style.visibility = 'visible';
        mapLayout.style.visibility = 'hidden';
    }

    //Flys back to location without user seeing
    //Flys back out to standard view
    // const nycLatLng = [40.7128, -74.0060];
    // flyToLocation(40.7128, -74.0060, 16);
});
