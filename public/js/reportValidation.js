import * as helpers from "./helpers.js";

document.addEventListener("DOMContentLoaded", () => {

    //client side validation of the rodent report form
    const rodentForm = document.getElementById("rodentForm");

    rodentForm.addEventListener("submit", (e)=>{


        const description = document.getElementById("description").value.trim();
        const latitude = document.getElementById("latitude").value.trim();
        const longitude = document.getElementById("longitude").value.trim();


        // const zipcode = document.getElementById("zipcode").value.trim();

        let error;

        //Validation of each
        try{
            let validatedDescription = helpers.checkDescription(description);
            let validatedLatitude = helpers.checkLatitude(latitude);
            let validatedLongitude = helpers.checkLongitude(longitude);
            // let validatedZipcode = helpers.checkZipcode(zipcode);
        }catch(err){
            //stop the form
            e.preventDefault();
            //show in the form error
            const errorBox = document.getElementById("formErrors");
            errorBox.innerHTML = `<p>${err}</p>`
            errorBox.hidden = false;
        }
    });
});