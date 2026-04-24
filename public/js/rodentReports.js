
//Allows rodent report on left to be clicked and then shows the details on the right
document.querySelector(".leftPane").addEventListener("click", async (e) => {

    // allows full card to be clicked
    const card = e.target.closest(".ratCard");
    //ignores clicks in the pane that arent on a card
    if(!card) return;

    //Gets the id of that rodent
    const id = card.dataset.id;
    console.log(id);

    //get the data for that id by calling the api
    const res = await fetch(`/rodentReports/${id}`);

    let data = await res.json()

    let ratDetail = document.getElementById('ratReportDetail')

    ratDetail.innerHTML = `
        <h2>Report ${data._id}</h2>
        <p>Date: ${data.inspectionDate}</p>
        <p>Status: ${data.status}</p>
        <p>Timestamp: ${data.timestamp}</p>
        <p>zipcode: ${data.zipcode}</p>
        <p>latitude: ${data.latitude}</p>
        <p>longitude: ${data.longitude}</p>
    `;

    //Heatmap update - set the heatmaps view to be the center of this elements lat and long coordinates
    const lo = [data.latitude, data.longitude]
    //clear all old markers

    //set the center view (use fly to or pan to?)
    map.panTo(lo, 14, {animate: true, duration: 0.5}); 
    // map.flyTo(lo, map.getZoom(), { duration: 0.3 });
    //add new marker to the map for that rodent sighting
    //TODO - set a marker icon to be a small rat??? use L.Icon from docs
    L.marker([data.latitude, data.longitude])
                .addTo(map)
                .bindPopup(data._id);

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

//Auto sets the date filters to be today and last 30 days
const today = new Date().toISOString().split('T')[0];
let monthAgo = new Date();
monthAgo.setDate(monthAgo.getDate() - 30);
monthAgo = monthAgo.toISOString().split('T')[0];
let startDate = document.getElementById("startDate");
startDate.value = monthAgo
let endDate = document.getElementById("endDate");
endDate.value = today

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
    let cards = document.querySelectorAll(".ratCard");
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
document.getElementById('startDate').addEventListener('change', filterElements);
document.getElementById('endDate').addEventListener('change', filterElements);
document.getElementById("verifiedStatus").addEventListener('change', filterElements);


//A clear filters button RESETS ALL FILTERS
document.getElementById('clearFilters').addEventListener("click", function(){
    
    //set all filters back to default
    let verifiedButton = document.getElementById("verifiedStatus")
    verifiedButton.checked = false

    startDate.value = monthAgo
    endDate.value = today
   
    //Set all cards back to show
    let cards = document.querySelectorAll(".ratCard");
    for(card of cards){
        card.style.display = '';
    }
})




//set map as a global var to edit 
let map;

//Rodent Report Heatmap Function
//will display as a minimap with the rodent report coordinate as its center marking point
//Make small and not scrollable
window.addEventListener('load', () => {

    const mapEl = document.getElementById('miniHeatmap');
    if (!mapEl) {
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
    map = L.map('miniHeatmap', {
        preferCanvas: true,
        dragging: false,
        zoomControl: false,       //Removes the +/- buttons
        scrollWheelZoom: false,   //Disables mouse wheel zoom
        doubleClickZoom: false,   //Disables zoom on double-click
        touchZoom: false,         //Disables pinch-to-zoom on mobile
        boxZoom: false            //Disables zoom by dragging with shift key
    }).setView(nycLatLng, 14);


    //map layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);


    // restaurant marker (only showing one since it should just be current rodent report)
    if (typeof restaurantMapData !== 'undefined') {
        console.log(restaurantMapData);
        restaurantMapData.forEach(restaurant => {
            // console.log(restaurant);
            L.marker([restaurant.lat, restaurant.lng])
                .addTo(map)
                .bindPopup(restaurant.name);
        });
    }

    setTimeout(() => {
        map.invalidateSize(true);
    }, 0);
});





