//Place general page nav here ???? - Peter

import { Router } from 'express';
const router = Router();
import { getAllRestaurants, getRestaurantById } from '../data/restaurants.js';
import { getAllReports} from '../data/rodentReports.js'
import { getUserById } from '../data/users.js';
import { checkId } from '../helpers.js';
import NodeGeocoder from 'node-geocoder';
import { countStats } from '../data/utility.js';

/**
 * Homepage route
 */
router.route(['/', '/home']).get(async (req, res) => { //Both of these routes will go to the homepage. Not sure if this is correct design or if should redirect - peter
    try {
        const {
            totalRestaurants,
            totalReports,
            totalUsers,
            totalVerified
        } = await countStats();

        res.render("home", {
            title: 'Homepage',
            homeTotalRestaurants: totalRestaurants,
            homeTotalReports: totalReports,
            homeTotalUsers: totalUsers,
            homeVerifiedSightings: totalVerified
        });
    } catch(error) {
        console.error(error);
        res.status(500).send("Error loading Homepage");
    }
});

/**
 * Homepage AJAX updates statistics - homePolling.js
 */
router.route('/api/home-data').get(async (req, res) => {
    try {
        const homeStats = await countStats();

        res.json(homeStats);
    } catch(error) {
        console.error(error);
        res.status(500).send("Unable to retrieve Homepage statistics");
    }
})

router.route('/heatmap').get(async (req, res) => {
    try {

        // get restaurant data
        const restaurantList = await getAllRestaurants();
        const restaurantData = restaurantList.map(r => ({
            _id: r._id,
            name: r.name,
            lat: Number(r.latitude),
            lng: Number(r.longitude)
        }));
        const restaurantMapData = JSON.stringify(restaurantData);

        // get rodent data
        const rodentList = await getAllReports();
        const rodentData = rodentList.map(r => ({
            _id: r._id,
            lat: Number(r.latitude),
            lng: Number(r.longitude),
            status: r.status
        }));
        const rodentMapData = JSON.stringify(rodentData);

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
            rodentMapData: rodentMapData,
            hotspotFeed: hotspotFeed
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading Heatmap");
    }
});

router.route('/ratreports').get(async (req, res) => {
    try {

        //TODO - allow this route to be called with a req payload storing the rodent report to be opened? - need to check with @olivia

        //TODO -  error handling and invalid data checking

        //get all reports
        let reports = await getAllReports();

        //set the minimaps location to be first report if available
        let firstReport = reports[0]
        const firstLocation = {
            name: firstReport.name,
            lat: Number(firstReport.latitude),
            lng: Number(firstReport.longitude)
        }

        //put object in arr since its iterated when the maps built
        const restaurantData = [firstLocation];

        const restaurantMapData = JSON.stringify(restaurantData);

        res.render("ratreports", {
            title: 'Rat Reports',
            reports:reports,
            restaurantMapData: restaurantMapData,
            firstReport: firstReport //passing in first report which will be the default starting data shown
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading Rat Reports");
    }
});

const gradeToStatus = (grade) => {
  if (grade === 'A') return { key: 'safe',      label: 'Safe' };
  if (grade === 'B') return { key: 'watchlist', label: 'Watchlist' };
  if (grade === 'C') return { key: 'danger',    label: 'Danger' };
  return { key: 'unknown', label: 'Not Graded' };
};

// Normalizing into template
const normalizeRestaurant = (r) => ({
  id: r._id?.toString(),
  name: r.name,
  borough: r.boro,
  cuisine: r.type,
  address: [r.building, r.street].filter(Boolean).join(' '),
  zipcode: r.zipcode ? String(r.zipcode).split('.')[0] : '',
  phone: r.phone,
  grade: r.grade,
  rodentScore: r.score,
  lastVerified: r.gradeDate,
  status: gradeToStatus(r.grade),
  recentReports: 0 // TODO - count from rodentReports collection once linked
});

router.route('/restaurants').get(async (req, res) => {
    try {
        const search   = (req.query.search || '').trim();
        const borough  = req.query.borough || 'all';
        const status   = req.query.status  || 'all';

        const all = (await getAllRestaurants()).map(normalizeRestaurant);

        const filtered = all.filter(r => {
            const matchSearch  = !search || (r.name || '').toLowerCase().includes(search.toLowerCase());
            const matchBorough = borough === 'all' || r.borough === borough;
            const matchStatus  = status  === 'all' || r.status.key === status;
            return matchSearch && matchBorough && matchStatus;
        });

        res.render("restaurants", {
            title: 'Restaurants',
            restaurants: filtered,
            count: filtered.length,
            countLabel: filtered.length === 0
                ? 'No restaurants'
                : `${filtered.length} restaurant${filtered.length === 1 ? '' : 's'}`,
            filters: { search, borough, status },
            boroughOptions: ['Manhattan','Brooklyn','Queens','Bronx','Staten Island'].map(b => ({
                value: b, label: b, selected: borough === b
            })),
            statusOptions: [
                { value: 'safe',      label: 'Safe',      selected: status === 'safe' },
                { value: 'watchlist', label: 'Watchlist', selected: status === 'watchlist' },
                { value: 'danger',    label: 'Danger',    selected: status === 'danger' }
            ],
            allBoroughsSelected: borough === 'all',
            allStatusesSelected: status === 'all'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading Restaurants");
    }
});

router.route('/restaurants/:id').get(async (req, res) => {
    try {
        const id = req.params.id.trim();
        const validatedId = checkId(id);
        const raw = await getRestaurantById(validatedId);
        const restaurant = normalizeRestaurant(raw);
        res.render("restaurant", {
            title: `${restaurant.name} - SqueakPeek`,
            restaurant,
            comments: [] // TODO:load from getRestaurantComments(id)
        });
    } catch (error) {
        console.error(error);
        res.status(404).send("Restaurant not found");
    }
});
router.route('/profile').get(async (req, res) => {
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



//DISPLAY REPORT CREAITON FORM FOR SET UP, 
router.route('/createReport').get(async (req, res) => {

    // grab the lat and lon from the map click, default value if no map click
    const lat = req.query.lat ? Number(req.query.lat) : 40.6940285125;
    const lng = req.query.lng ? Number(req.query.lng) : -73.9348118964;

    const firstLocation = {
        name: 'userClickedHere',
        lat: lat,
        lng: lng
    };

    // Docs for node-geocoder https://www.npmjs.com/package/node-geocoder
    const geocoder = NodeGeocoder({provider: 'openstreetmap'});

    const geoResult = await geocoder.reverse({ lat: 40.7, lon: -73.9 });
    const zip = geoResult[0]?.zipcode || null;

    const restaurantData = [firstLocation];
    const restaurantMapData = JSON.stringify(restaurantData);

    
    res.render("createReport", {
        title: 'Create Report',
        restaurantMapData: restaurantMapData,
        lat: lat,
        lng: lng,
        zip: zip,
    });
});


export default router;