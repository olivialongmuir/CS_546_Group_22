
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