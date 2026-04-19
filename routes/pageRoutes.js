//Place general page nav here ???? - Peter

import { Router } from 'express';
const router = Router();
import { getAllRestaurants } from '../data/restaurants.js';

import { getAllReports} from '../data/rodentReports.js'
import { getUserById } from '../data/users.js';

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

router.route('/profile').get(async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  try {
    const dbUser = await getUserById(req.session.userId);

    const joinedDate = new Date(dbUser.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });

    const user = {
      avatar: '🐭',
      name: `${dbUser.firstName} ${dbUser.lastName}`,
      email: dbUser.emailAddress,
      userType: dbUser.type.charAt(0).toUpperCase() + dbUser.type.slice(1),
      reportsSubmitted: 0,
      savedRestaurants: 0,
      notifications: 0,
      joinedDate,
      activity: []
    };

    return res.render('profile', { title: 'SqueakPeek - Profile', user });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error loading Profile');
  }
});

export default router;