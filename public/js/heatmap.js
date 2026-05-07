// global variables
let map;
let popupMap //secondary map rendered into the rodent report pop up
let registerMap //secondary map redered into the restaurnat report pop up
let heat;
let heatDataGlobal = [];
let searchInput;
let searchButton;
let colorBtn;
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

    const savedTheme = localStorage.getItem('mapTheme');
    const savedColor = localStorage.getItem('heatColor');
  
    // toggle light or dark map
    const toggle = document.getElementById('themeToggle');
    const iconContainer = document.getElementById('themeIcon');

    let isLight = savedTheme === 'light';
    if (isLight) {
        document.body.classList.add('light-map');
        iconContainer.innerHTML = `<i data-lucide="sun"></i>`;
    } else {
        iconContainer.innerHTML = `<i data-lucide="moon"></i>`;
    }
    lucide.createIcons();

    // choose heat color
    colorBtn = document.getElementById('heatColorBtn');
    const colorPicker = document.getElementById('heatColorPicker');
    
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
                .bindPopup(
                        `<div class="btn-stack">
                            <div class="popUpText">
                                <p class="popUp-p">${restaurant.name}</p>
                            </div>
                            <div class="infoRow">
                                <span class="locationStat">Lat: ${restaurant.lat}</span>
                                <span class="locationStat">Lng: ${restaurant.lng}</span>
                            </div>
                            <a href="/restaurants/${restaurant._id}" class="popup-link">
                            <button class="btn popup-btn">View Restaurant</button>
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

            //Set null descriptions to say a geenric message!
            let description = r.description
            if(description == null){
                description = "A rodent was reported here!!!";
            }

            const marker = L.marker([Number(r.lat), Number(r.lng)], { icon: ratPin })
                .bindPopup(
                        `<div class="btn-stack">
                        <div class="popUpText">
                            <p class="popUp-p">${description}</p>
                        </div>
                        <div class="infoRow">
                            <span class="locationStat">Lat: ${r.lat}</span>
                            <span class="locationStat">Lng: ${r.lng}</span>
                        </div>
                         <a href="/ratreports/${r._id}" class="popup-link">
                         <button class="btn popup-btn">View Report</button>
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

        // set global heat data for use in color changes
        heatDataGlobal = heatData;

        // heatmap
        if (savedColor) {
            buildHeatmap(savedColor);
        } else {
            buildHeatmap('#ff0000'); // default red
        }
    };

    // dynamic zoom
    map.on('zoomend', updateLayers);
    updateLayers();


    // right click on the map to then zoom in and display a pop up for the user. 
    //The pop up will contain prompt to make a new report
    map.on('contextmenu', function (e) {

        //clear stale pins
        removePins(map);

        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        //fly and zoom into that position
        flyToLocation(lat,lng, 17);

        //Drop a temp pin in that location
        addPin(map, lat, lng);

        
        // window.location.href = `/createReport?lat=${lat}&lng=${lng}`;
    });


    //Event listener to remove old pins
    map.on('click', function () {
        removePins(map);
    });
    map.on('popupclose', function () {
        removePins(map);
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

    toggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-map');
        localStorage.setItem('mapTheme', isLight ? 'light' : 'dark');
        iconContainer.innerHTML = `<i data-lucide="${isLight ? 'sun' : 'moon'}"></i>`;
        lucide.createIcons();
    });

    colorBtn.addEventListener('click', () => {
        colorPicker.click();
    });

    colorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        localStorage.setItem('heatColor', color);
        buildHeatmap(color);
    });

    setTimeout(() => {
        map.invalidateSize(true);
    }, 0);
});

// Helper to change the color of the heatmap based on user input
function buildHeatmap(color) {
    if (heat) {
        map.removeLayer(heat);
        heat = null;
    }
    heat = L.heatLayer(heatDataGlobal, {
        radius: 50,
        blur: 15,
        maxZoom: 17,
        gradient: {
            0.0: color,
            1.0: color
        }
    });
    heat.addTo(map);
    colorBtn.style.backgroundColor = color;
}

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
            <button class="resgisterBtn btn popup-btn" style="background-color: grey";>Register Restaurant</button>
            <button class="createReportBtn btn popup-btn">Create Rodent Report</button>
            </div>`
}

//Created and returns an HTML stub for map pop up that can direct user to login or sign up
const loginPopUp=(lat,lng)=>{
            return`
            <div class="popUpText">
                <p class="popUp-p"
                >Login or Sign Up today to report rodents!</p>
            </div>
            <div class="infoRow">
                <span class="locationStat">Lat: ${lat}</span>
                <span class="locationStat">Lng: ${lng}</span>
            </div>
            <div class="btn-stack">
                <a href="/register" class="popup-link">
                    <button class="btn popup-btn" style="background-color: grey">Sign Up</button>
                </a>
                <a href="/login" class="popup-link">
                    <button class="btn popup-btn">Login</button>
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
        newPin.bindPopup(loginPopUp(lat,lng));
    }
    

    //Open the pop up for user to see
    newPin.openPopup();

    //Add to pins list
    activePins.push(newPin);
}

//Removes all active pins
const removePins=(map)=>{
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



//Shows a target pop up card
const showPopUp=(popUp)=>{
    //get the pop up by id
    popUp = document.getElementById(popUp);
    const mapLayout = document.getElementById("heatmapLayout");

    //now set visbility of all elements
    if(popUp){
        //show pop up
        popUp.style.visibility = 'visible';
        mapLayout.style.visibility = 'hidden';
    }
}


//Hides the create report pop up
const hidePopUp=(popUp)=>{

    //get the pop up form to show
    popUp = document.getElementById(popUp);
    const mapLayout = document.getElementById("heatmapLayout");

    if(popUp){
        popUp.style.visibility = '';
        mapLayout.style.visibility = 'visible';
    }

    //remove the rat pin that had been added to the minimap
    removePins(popupMap);

    //Flys the user back to  map
    flyToLocation(lastLat, lastLng, 16);
}


//Hides the create report popup if the cancel button is pressed
document.getElementById("cancelSubmit")?.addEventListener('click', ()=>{
    hidePopUp("reportPopUp");
})


//hides any active pop up if user clicks outside of the popup
document.addEventListener('click', (e)=>{
    if(e.target.id =='reportPopUp'){
        hidePopUp("reportPopUp");
    }

    if(e.target.id == "restaurantPopUp"){
        hidePopUp("restaurantPopUp");
    }
});


//Hides if the user cancels the restaurant submisison
document.getElementById("restaurantCancelSubmit")?.addEventListener('click', ()=>{
    hidePopUp("restaurantPopUp");
})



//Opens the create report popup and populates form
document.addEventListener('click', (e)=>{
    //listens for clicks on the entire page

    //if the click occured on a create report button class then this function will fire
    const btn = e.target.closest('.createReportBtn');
    if (!btn) return;

    //Populate the lat and long pill buttons
    document.getElementById("latStat").innerText = `Lat: ${lastLat}`;
    document.getElementById("lngStat").innerText = `Lng: ${lastLng}`;


    //Prepopulate the forms fiedls with user info and location
    document.getElementById("latitude").value = lastLat;
    document.getElementById("longitude").value = lastLng;

    //Navigates the pop up map to target location
    popupMap.panTo([lastLat,lastLng], {duration:0.1});

    //Add mini rat pin to that location
    newPin = L.marker([lastLat, lastLng], { icon: ratPin })
        .addTo(popupMap)

    //Add pin to active pins arr
    activePins.push(newPin);

    //shows the report card
    showPopUp("reportPopUp");
});




//Opens the register restaurant popup and populates form
document.addEventListener('click', (e)=>{
    //listens for clicks on the entire page

    //if the click occured on a create report button class then this function will fire
    const btn = e.target.closest('.resgisterBtn');
    if (!btn) return;

    //Populate the lat and long pill buttons
    document.getElementById("restaurant-latStat").innerText = `Lat: ${lastLat}`;
    document.getElementById("restaurant-lngStat").innerText = `Lng: ${lastLng}`;

    //Prepopulate the forms fiedls with user info and location
    document.getElementById("restaurant-latitude").value = lastLat;
    document.getElementById("restaurant-longitude").value = lastLng;

    //Navigates the pop up map to target location
    registerMap.panTo([lastLat,lastLng], {duration:0.1});

    //Add mini rat pin to that location
    newPin = L.marker([lastLat, lastLng], { icon: restaurantPin })
        .addTo(registerMap)

    //Add pin to active pins arr
    activePins.push(newPin);

    //shows the report card
    showPopUp("restaurantPopUp");

});



//Pop up map function for redering a minimap in the rodent report Pop up
//will display as a popupMap with the rodent reportor restuarant coordinate as its center marking point
window.addEventListener('load', () => {
    
    const popupMapEl = document.getElementById('miniHeatmap');
    if (!popupMapEl) {
        console.error('miniHeatmap element not found');
        return;
    }

    //Set in default location for map
    const nycLatLng = [40.7128, -74.0060];

    // grab saved map theme from localStorage and apply it to the mini map
    const savedTheme = localStorage.getItem('mapTheme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-map');
    } else {
        document.body.classList.remove('light-map');
    }

    //initialize the map and set the rules
    popupMap = L.map('miniHeatmap', {
        preferCanvas: true,
        dragging: false,
        zoomControl: false,       //Removes the +/- buttons
        scrollWheelZoom: false,   //Disables mouse wheel zoom
        doubleClickZoom: false,   //Disables zoom on double-click
        touchZoom: false,         //Disables pinch-to-zoom on mobile
        boxZoom: false            //Disables zoom by dragging with shift key
    }).setView(nycLatLng, 16);

    //map layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(popupMap);

    // restaurant marker (only showing one since it should just be current rodent report)
    L.marker(nycLatLng, { icon: ratPin})
                .addTo(popupMap)
                .bindPopup("SQUEAK!!", {
                    className: 'light-popup'
                });
    
    setTimeout(() => {
        popupMap.invalidateSize(true);
    }, 0);
});



//Pop up map function for redering a minimap in the restaurant registration pop up
window.addEventListener('load', () => {
    
    const restaurantMapEl = document.getElementById('registerHeatmap');
    if (!restaurantMapEl) {
        console.error('miniHeatmap element not found');
        return;
    }

    //Set in default location for map
    const nycLatLng = [40.7128, -74.0060];

    // grab saved map theme from localStorage and apply it to the mini map
    const savedTheme = localStorage.getItem('mapTheme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-map');
    } else {
        document.body.classList.remove('light-map');
    }

    //initialize the map and set the rules
    registerMap = L.map('registerHeatmap', {
        preferCanvas: true,
        dragging: false,
        zoomControl: false,       //Removes the +/- buttons
        scrollWheelZoom: false,   //Disables mouse wheel zoom
        doubleClickZoom: false,   //Disables zoom on double-click
        touchZoom: false,         //Disables pinch-to-zoom on mobile
        boxZoom: false            //Disables zoom by dragging with shift key
    }).setView(nycLatLng, 16);

    //map layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(registerMap);

    // restaurant marker (only showing one since it should just be current rodent report)
    L.marker(nycLatLng, { icon: ratPin})
                .addTo(registerMap)
                .bindPopup("SQUEAK!!", {
                    className: 'light-popup'
                });
    
    setTimeout(() => {
        registerMap.invalidateSize(true);
    }, 0);
});

