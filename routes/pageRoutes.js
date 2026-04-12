//Place general page nav here ???? - Peter

import { Router } from 'express';
const router = Router();
import { getAllRestaurants } from '../data/restaurants.js';


router.route(['/', '/home']).get(async (req, res) => { //Both of these routes will go to the homepage. Not sure if this is correct design or if should redirect - peter
    return res.render("home");
});

router.route('/heatmap').get(async (req, res) => {
    try {
        const restaurantList = await getAllRestaurants();

        const restaurantData = restaurantList.map(r => ({
            name: r.name,
            lat: Number(r.latitude),
            lng: Number(r.longitude)
        }));

        const restaurantMapData = JSON.stringify(restaurantData);

        return res.render("heatmap", {
            restaurantMapData: restaurantMapData
            // TODO - pass in rodent data
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send("Error loading heatmap");
    }
});

router.route('/ratreports').get(async (req, res) => {
    return res.render("ratreports");
});

router.route('/restaurants').get(async (req, res) => {
    return res.render("restaurants");
});

export default router;