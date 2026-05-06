//Place general page nav here ???? - Peter

import { Router } from 'express';
const router = Router();
import { getAllRestaurants, getRestaurantById, getRestaurantComments } from '../data/restaurants.js';
import { getAllReports, getReportById, getRodentReportComments} from '../data/rodentReports.js';
import { getUserById, getUserActivity } from '../data/users.js';
import { createComment, deleteComment, getCommentById} from '../data/comments.js';
import { updateCommentReaction, updateRestaurantReaction } from "../data/reactions.js";
import { checkId, getLocationFromZip, countToStatus, gradeToStatus, normalizeRestaurant } from '../public/js/helpers.js';
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

        // get rodent data
        const rodentList = await getAllReports();
        const rodentData = rodentList.map(r => ({
            _id: r._id,
            lat: Number(r.latitude),
            lng: Number(r.longitude),
            zip: r.zipcode,
            status: r.status,
            description: r.description
        }));

        // group rodent data for hotspot list by borough and neighborhood
        const counts = {};
        rodentData.forEach(r => {
            const { borough, neighborhood } = getLocationFromZip(r.zip);
            const key = `${borough}||${neighborhood}`;
            if (!counts[key]) {
                counts[key] = {
                    borough,
                    neighborhood,
                    count: 0
                };
            }
            counts[key].count++;
        });

        const hotspotFeed = Object.values(counts)
            .map(item => {
                const risk = countToStatus(item.count);

                return {
                    ...item,
                    riskKey: risk.key,
                    riskLabel: risk.label
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);


        //Check if the user is authenticated or not. This will set a var flag for userAuthenticated. This controls pop up logic
        let userAuthenticated = req.session.userId;
        if(userAuthenticated == undefined){
            userAuthenticated = false;
        }else{
            userAuthenticated = true;
        }


        res.render("heatmap", {
            title: 'Heatmap',
            restaurantMapData: restaurantData,
            rodentMapData: rodentData,
            hotspotFeed: hotspotFeed,
            userAuthenticated: userAuthenticated
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading Heatmap");
    }
});

//Generic Route which is called from the nav bar route. Will send user to first available rodent report page.
router.route('/ratreports').get(async (req, res) => {
    try {
        //get all reports
        let reports = await getAllReports();

        //if reports is empty redirect to error page
        if(reports.length == 0){
            res.redirect('/error');
        }

        //route user to first report
        let firstReport = reports[0]
        res.redirect(`/ratreports/${firstReport._id}`);

    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading Rodent Reports");
    }
});

//Route which allows you to pre-filter to a specific report by ID. The target report will be the data used to prepopulate first shown report
router.route('/ratreports/:id').get(async (req, res) => {
    try {

        //validate the id
        const id = req.params.id.trim();
        const validatedId = checkId(id);

        let targetReport = await getReportById(validatedId);

        //TODO if there is no report then raise error?

        //get all reports to be shown
        let reports = await getAllReports();

        //gets the location of the specified report
        const location = {
            name: targetReport.name,
            lat: Number(targetReport.latitude),
            lng: Number(targetReport.longitude)
        }

        //put object in arr since its iterated when the maps built
        //Set the users map location
        const restaurantData = [location];
        const restaurantMapData = JSON.stringify(restaurantData);

        //Set name of user using their ID. Otherwise is "Unknown User"
        if(targetReport.userId == null){
            targetReport.reporter = "Unknown Reporter";
        }else{
            let user = await getUserById(targetReport.userId);
            targetReport.reporter = user.username
        }

        //Load in the comments from that report
        const comments = await getRodentReportComments(validatedId);
        const rodentComments = await Promise.all(
            comments.map(async (c) => {
                const user = await getUserById(c.userId);
                return {
                    ...c,
                    userName: user.username
                };
            })
        );


        res.render("rodentReports", {
            title: 'Rodent Reports',
            reports:reports,
            restaurantMapData: restaurantMapData,
            report: targetReport, //passing in target report
            comments:rodentComments,
            currentUserId: req.session.userId
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading Rodent Reports");
    }
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
        const comments = await getRestaurantComments(validatedId);
        const restaurantComments = await Promise.all(
            comments.map(async (c) => {
                const user = await getUserById(c.userId);
                return {
                    ...c,
                    userName: user.username
                };
            })
        );
        res.render("restaurant", {
            title: `${restaurant.name} - SqueakPeek`,
            restaurant,
            comments: restaurantComments,
            currentUserId: req.session.userId
        });
    } catch (error) {
        console.error(error);
        res.status(404).send("Restaurant not found");
    }
});

router.post('/comments/:id/delete', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(403).json({ error: "Not logged in" });

    const commentId = checkId(req.params.id.trim());
    const comment = await getCommentById(commentId);

    if (comment.userId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await deleteComment(commentId);

    return res.json({ success: true });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error deleting comment" });
  }
});

//Posts a comment for a restuarant
router.post('/restaurants/:id/comments', async (req, res) => {

  const restaurantId = checkId(req.params.id.trim());

  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(403).redirect('/login');
    }

    const { comment } = req.body;
    // validation
    if (!comment || typeof comment !== 'string') {
      throw 'Comment must be a string';
    }
    const trimmedComment = comment.trim();
    if (trimmedComment.length === 0) {
      throw 'Comment cannot be empty';
    }
    if (trimmedComment.length > 500) {
      throw 'Comment cannot exceed 500 characters';
    }

    await createComment(userId, 'restaurant', restaurantId, trimmedComment);

    // if no error was caught reload the page
    return res.redirect(`/restaurants/${restaurantId}`);

  } catch (error) {
    // if error was caught load page with error to display
    const raw = await getRestaurantById(restaurantId);
    const restaurant = normalizeRestaurant(raw);
    const comments = await getRestaurantComments(restaurantId);

    const restaurantComments = await Promise.all(
      comments.map(async (c) => {
        const user = await getUserById(c.userId);
        return {
          ...c,
          userName: user.username
        };
      })
    );

    return res.status(400).render("restaurant", {
      title: `${restaurant.name} - SqueakPeek`,
      restaurant,
      comments: restaurantComments,
      error: error || "Something went wrong",
      formData: req.body
    });
  }
});



//Posts a comment for a rodent report
router.post('/rodentReports/:id/comments', async (req, res) => {

    //use rodent report id insteaf of a restaurant
    const reportId = checkId(req.params.id.trim());

  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(403).redirect('/login');
    }

    const { comment } = req.body;
    // validation
    if (!comment || typeof comment !== 'string') {
      throw 'Comment must be a string';
    }
    const trimmedComment = comment.trim();
    if (trimmedComment.length === 0) {
      throw 'Comment cannot be empty';
    }
    if (trimmedComment.length > 500) {
      throw 'Comment cannot exceed 500 characters';
    }

    //Creates a comment using a rodent ID
    await createComment(userId, 'rodent', reportId, trimmedComment);

    // if no error was caught reload the page
    return res.redirect(`/ratreports/${reportId}`);

  } catch (error) {
    //TODO - just sending them to a generic error page 
    res.status(404).render('error adding comment to rodent report');
  }
});






router.post('/comments/:id/like', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(403).json({ error: "Not logged in" });
    const commentId = checkId(req.params.id.trim());
    const updatedComment = await updateCommentReaction(userId, commentId, "like");

    return res.json({
      success: true,
      stats: updatedComment.stats
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to like comment" });
  }
});

router.post('/comments/:id/dislike', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(403).json({ error: "Not logged in" });
    }
    const commentId = checkId(req.params.id.trim());
    const updatedComment = await updateCommentReaction(userId, commentId, "dislike");

    return res.json({
      success: true,
      stats: updatedComment.stats
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to dislike comment" });
  }
});

router.post('/restaurants/:id/like', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(403).json({ error: "Not logged in" });

    const restaurantId = checkId(req.params.id.trim());

    const updated = await updateRestaurantReaction(userId, restaurantId, "like");

    return res.json({
      success: true,
      stats: updated.stats
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to like restaurant" });
  }
});

router.post('/restaurants/:id/dislike', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(403).json({ error: "Not logged in" });

    const restaurantId = checkId(req.params.id.trim());

    const updated = await updateRestaurantReaction(userId, restaurantId, "dislike");

    return res.json({
      success: true,
      stats: updated.stats
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to dislike restaurant" });
  }
});

router.route('/profile').get(async (req, res) => {
  try {

    const dbUser = await getUserById(req.session.userId);

    const joinedDate = new Date(dbUser.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });


    const activity = await getUserActivity(req.session.userId);

    const user = {
      avatar: '🐭',
      name: `${dbUser.firstName} ${dbUser.lastName}`,
      email: dbUser.emailAddress,
      userType: dbUser.type.charAt(0).toUpperCase() + dbUser.type.slice(1),
      reportsSubmitted: 0,
      savedRestaurants: 0,
      notifications: 0,
      joinedDate,
      activity: activity
    };

    return res.render('profile', { title: 'SqueakPeek - Profile', user });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error loading Profile');
  }
});

export default router;