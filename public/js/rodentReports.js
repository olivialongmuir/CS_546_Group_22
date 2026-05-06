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

    //get the lat and long of the current restaurant
    let temp = restaurantMapData[0];
    let lat = temp.lat
    let lng = temp.lng
    


    //set map center to the current restaurant
    const nycLatLng = [lat, lng];

    
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
    if (typeof restaurantMapData !== 'undefined') {
        restaurantMapData.forEach(restaurant => {
            L.marker([restaurant.lat, restaurant.lng], { icon: miniRatPin})
                .addTo(miniMap)
                .bindPopup(restaurant.name);
        });
    }

    setTimeout(() => {
        miniMap.invalidateSize(true);
    }, 0);
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
    const res = await fetch(`/rodentReports/${id}`);

    let data = await res.json()

    //Set the element value
    //zipcode, latitude, longitude, status
    let zipcode = document.getElementById('zipcode')
    zipcode.textContent = `Zipcode: ${data.zipcode}`

    let latitude = document.getElementById('latitude')
    latitude.textContent = `Lat: ${data.latitude}`

    let longitude = document.getElementById('longitude')
    longitude.textContent = `Lng: ${data.longitude}`

    let status = document.getElementById('status')
    status.textContent = `Status: ${data.status}`

    //TODO - set the description and user

    
    //Heatmap update - set the heatmaps view to be the center of this elements lat and long coordinates
    const lo = [data.latitude, data.longitude]
    //clear all old markers

    //set the center view (use fly to or pan to?)
    miniMap.panTo(lo, 14, {animate: true, duration: 0.5}); 
    // map.flyTo(lo, map.getZoom(), { duration: 0.3 });
    //set a marker icon to be a small rat??? use L.Icon from docs

    //add new marker to the map for that rodent sighting
    L.marker([data.latitude, data.longitude], { icon: miniRatPin }).addTo(miniMap).bindPopup(data._id);

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








