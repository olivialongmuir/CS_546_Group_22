//Place general page nav here ???? - Peter

import { Router } from 'express';
const router = Router();
import { getAllRestaurants } from '../data/restaurants.js';

import { getAllReports} from '../data/rodentReports.js'

router.route(['/', '/home']).get(async (req, res) => { //Both of these routes will go to the homepage. Not sure if this is correct design or if should redirect - peter
    try {
        res.render("home", {
            title: 'Homepage'
        });
    } catch(error) {
        console.error(error);
        res.status(500).send("Error loading Homepage");
    }
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

        res.render("heatmap", {
            title: 'Heatmap',
            restaurantMapData: restaurantMapData
            // TODO - pass in rodent data
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading Heatmap");
    }
});

router.route('/ratreports').get(async (req, res) => {
    try {

        let reports = await getAllReports();

        res.render("ratreports", {
            title: 'Rat Reports',
            reports:reports
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading Rat Reports");
    }
});

router.route('/restaurants').get(async (req, res) => {
    try {
        res.render("restaurants", {
            title: 'Restaurants'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading Restaurants");
    }
});

export default router;