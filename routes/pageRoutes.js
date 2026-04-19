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

        // TODO - hone in on hotspot feed
        // potentially grab restaurants with top comments
        // or grab rodent data with top comments
        const hotspotFeed = restaurantList.slice(0, 9).map(r => ({
            name: r.name,
            status: r.status ?? "Status Unavailable"
        }));

        res.render("heatmap", {
            title: 'Heatmap',
            restaurantMapData: restaurantMapData,
            hotspotFeed: hotspotFeed
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
  // TODO: remove hard-coded user
  const user = {
    avatar: '🐭',
    name: 'Demo User',
    email: 'demo@stevens.edu',
    userType: 'Consumer',
    reportsSubmitted: 7,
    savedRestaurants: 12,
    notifications: 3,
    joinedDate: 'Jan 2026',
    activity: [
      { color: 'green',  text: 'Submitted a rodent report for Joe\'s Pizza',     time: '2 hours ago'  },
      { color: 'blue',   text: 'Saved Halal Guys to your restaurant list',       time: 'Yesterday'    },
      { color: 'orange', text: 'New hotspot alert near Washington Square Park',  time: '3 days ago'   },
      { color: 'green',  text: 'Submitted a rodent report for Corner Deli',      time: '1 week ago'   },
      { color: 'blue',   text: 'Updated notification preferences',               time: '2 weeks ago'  }
    ]
  };
 
  return res.render('profile', { title: 'SqueakPeek - Profile', user });
});

export default router;