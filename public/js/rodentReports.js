//Rodent Report Heatmap Function
//will display as a minimap with the rodent report coordinate as its center marking point
//Make small and not scrollable

//set map as a global var to edit 
let miniMap;

//using alternative name for rat pin since used across multiple pages
let miniRatPin;

window.addEventListener('load', () => {
    
    const miniMapEl = document.getElementById('miniHeatmap');
    if (!miniMapEl) {
        console.error('miniHeatmap element not found');
        return;
    }

    //get the lat and long of the current pin drop
    //TODO map rendering bugfix
    let temp = restaurantMapData[0];
    //If there is no restaurant then set to default NYC data location as a default.
    let lat = temp?.lat ?? 40.7128
    let lng = temp?.lng ?? -74.0060

    //set map center to the current restaurant
    const nycLatLng = [lat, lng];

    
    // grab saved map theme from localStorage and apply it to the mini map
    const savedTheme = localStorage.getItem('mapTheme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-map');
    } else {
        document.body.classList.remove('light-map');
    }

    
    //initialize the map and set the rules
    miniMap = L.map('miniHeatmap', {
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
    }).addTo(miniMap);

    //Define pin syle to be used will update the global var
    miniRatPin = L.icon({
            iconUrl: '/public/images/rat_pin_alt.png',
            iconSize: [30, 30],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });


    // restaurant marker (only showing one since it should just be current rodent report)
    L.marker(nycLatLng, { icon: miniRatPin})
                .addTo(miniMap)
                .bindPopup("SQUEAK!!", {
                    className: 'light-popup'
                });
    

    setTimeout(() => {
        miniMap.invalidateSize(true);
    }, 0);
});



//Limits coordinates to designated area
const NYC_BOUNDS = { minLat: 40.4774, maxLat: 40.9176, minLng: -74.2591, maxLng: -73.7004 };

document.getElementById('rodentForm')?.addEventListener('submit', (e) => {
    const errEl = document.getElementById('reportError');
    if (errEl) {
        errEl.textContent = '';
        errEl.style.display = 'none';
    }

    const description = document.getElementById('description').value.trim();
    const lat = Number(document.getElementById('latitude').value);
    const lng = Number(document.getElementById('longitude').value);

    let error = null;
    if (!description) error = 'Error: Description is required';
    else if (description.length > 500) error = 'Error: Description cannot exceed 500 characters';
    else if (!Number.isFinite(lat) || lat < NYC_BOUNDS.minLat || lat > NYC_BOUNDS.maxLat)
        error = 'Error: Latitude must be within NYC';
    else if (!Number.isFinite(lng) || lng < NYC_BOUNDS.minLng || lng > NYC_BOUNDS.maxLng)
        error = 'Error: Longitude must be within NYC';

    if (error) {
        e.preventDefault();
        if (errEl) {
            errEl.textContent = error;
            errEl.style.display = '';
        }
    }
});


//Allows rodent report on left to be clicked and then shows the details on the right
document.querySelector(".leftPane")?.addEventListener("click", async (e) => {

    // allows full card to be clicked
    const card = e.target.closest(".rodent-card");
    //ignores clicks in the pane that arent on a card
    if(!card) return;

    //Gets the id of that rodent
    const id = card.dataset.id;

    //get the data for that id by calling the api
     res = await fetch(`/rodentReports/${id}`);

});


//FILTERING FUNCTIONS FOR RODENT REPORTS

//returns current date as str "YYYY-MM-DD" format to be used for join date
const getDateNow=()=>{
    const date = new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });

    return date
} 

//Auto sets the date filters to be today+1 and last 30 days
let today = new Date()
today.setDate(today.getDate() + 1)
today = today.toISOString().split('T')[0];

let monthAgo = new Date();
monthAgo.setDate(monthAgo.getDate() - 30);
monthAgo = monthAgo.toISOString().split('T')[0];

let startDate = document.getElementById("startDate");
if(startDate){
    startDate.value = monthAgo
}

let endDate = document.getElementById("endDate");
if(endDate){
    endDate.value = today
}


//Compares a date against a filter date. Returns true if first date1 came after date2
const compareDate =(date1, date2)=>{
    //both inputs are strings. convert back to date and then compare
    date1 = new Date(date1)
    date2 = new Date(date2)

    return date1 > date2
}

//verified status box
let verifiedStatus = document.getElementById("verifiedStatus")

//Function that will apply filter to DOM elements based on status of all filters
const filterElements=()=>{
    //determine if verififed or all should show

    //for all elements in column
    let cards = document.querySelectorAll(".rodent-card");
    for(card of cards){

        //flag to track if that card should be shown
        let show = true

        //filter of that card is in time window
        let cardDate = card.attributes['data-timestamp'].value
        //if date is not within range dont show it
        if(!(compareDate(cardDate, startDate.value) && (!compareDate(cardDate, endDate.value)))){
            show = false
        }

        //if the valid filter is checked then check that cards status
        if(verifiedStatus.checked){
                if(card.attributes['status-id'].value !== 'verified'){
                    show = false
                }
        }

        //show if true else false
        if(show){
            card.style.display = ''
        }else{
            card.style.display = 'none'
        }
    }
}


//add event listeners to both date selectors. on change update the visbility of cards in rat report
document.getElementById('startDate')?.addEventListener('change', filterElements);
document.getElementById('endDate')?.addEventListener('change', filterElements);
document.getElementById("verifiedStatus")?.addEventListener('change', filterElements);


//A clear filters button RESETS ALL FILTERS
document.getElementById('clearFilters')?.addEventListener("click", function(){
    
    //set all filters back to default
    let verifiedButton = document.getElementById("verifiedStatus")
    verifiedButton.checked = false

    startDate.value = monthAgo
    endDate.value = today
   
    //Set all cards back to show
    let cards = document.querySelectorAll(".rodent-card");
    for(card of cards){
        card.style.display = '';
    }
})


