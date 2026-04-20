
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
//Filters out non-verified reports based on filter checkbox
document.getElementById("verifiedStatus").addEventListener('change', function() {
  if (this.checked) {
    //if checked then hide all the non verified rodent reports
    //get all report with status-id of unverified
    let cards = document.querySelectorAll(".ratCard");
    for(card of cards){
        //check if that data-id should be hidden since its unverified
        let statusId = card.attributes['status-id'].value
        if(statusId == 'unverified'){
            card.style.display = 'none'
        }
    }
    //hide them
  } else {
    //show all
    let cards = document.querySelectorAll(".ratCard");
    for(card of cards){
        card.style.display = ''
    }

  }
});


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


//add event listeners to both date selectors. on change update the visbility of 
document.getElementById('startDate').addEventListener('change', function() {
    //get the date value of each
    //filter the cards that are not in that date range (if not already filtered)
    let cards = document.querySelectorAll(".ratCard");
    for(card of cards){
        //check if that data-id should be hidden since its unverified
        let cardDate = card.attributes['data-timestamp'].value

        //if that date is < start date then hide
        if(!compareDate(cardDate, startDate)){
            card.style.display = 'none';
        }
    }
})

//add event listeners to both date selectors. on change update the visbility of 
document.getElementById('endDate').addEventListener('change', function() {
    //get the date value of each
    //filter the cards that are not in that date range (if not already filtered)
    let cards = document.querySelectorAll(".ratCard");
    for(card of cards){
        //check if that data-id should be hidden since its unverified
        let cardDate = card.attributes['data-timestamp'].value

        //if that date is > end date then hide
        if(compareDate(cardDate, endDate)){
            card.style.display = 'none';
        }
    }
})

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