//Place general page nav here ???? - Peter

import { Router } from 'express';
const router = Router();


router.route(['/', '/home']).get(async (req, res) => { //Both of these routes will go to the homepage. Not sure if this is correct design or if should redirect - peter
    return res.render("home");
});

router.route('/heatmap').get(async (req, res) => {
    return res.render("heatmap");
});

router.route('/ratreports').get(async (req, res) => {
    return res.render("ratreports");
});

router.route('/restaurants').get(async (req, res) => {
    return res.render("restaurants");
});

export default router;