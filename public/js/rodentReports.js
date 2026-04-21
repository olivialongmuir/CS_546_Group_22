
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