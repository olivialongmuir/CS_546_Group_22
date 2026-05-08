
//Used to validate pop up form  entry from the client side for heatmaps

import * as helpers from "./helpers.js";

document.addEventListener("DOMContentLoaded", () => {

    //client side validation of the rodent report form
    document.getElementById("rodentForm")?.addEventListener("submit", (e)=>{
        const description = document.getElementById("description").value.trim();
        const latitude = document.getElementById("latitude").value.trim();
        const longitude = document.getElementById("longitude").value.trim();

        // const zipcode = document.getElementById("zipcode").value.trim();

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



    //client side validation of the restaurant submission
    document.getElementById("restaurantRegisterForm")?.addEventListener("submit", (e)=>{
        
        //get values
        const name = document.getElementById("name").value.trim();
        const type = document.getElementById("type").value.trim();
        const website = document.getElementById("website").value.trim();
        const phone = document.getElementById("phone").value.trim();

        //get the hidden values
        const latitude = document.getElementById("restaurant-latitude").value.trim();
        const longitude = document.getElementById("restaurant-longitude").value.trim();
        const status = document.getElementById("status").value.trim();


        //validate entries
        try{
            let validatedName = helpers.checkRestaurantName(name);
            let validatedType = helpers.checkRestaurantType(type);
            let validatedWebsite = helpers.checkWebsite(website);
            let validatedPhone = helpers.checkPhone(phone);
            let validatedLatitude = helpers.checkLatitude(latitude);
            let validatedLongitude = helpers.checkLongitude(longitude);
            let validatedStatus = helpers.checkRestaurantStatus(status);
        }catch(err){
            e.preventDefault();
            //show in the form error
            const errorBox = document.getElementById("registerFormError");
            errorBox.innerHTML = `<p>${err}</p>`
            errorBox.hidden = false;
        }
    })
});