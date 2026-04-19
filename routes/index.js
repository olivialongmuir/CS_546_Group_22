// INDEX FOR ROUTES
import {static as staticDir} from 'express';
import pageRoutes from './pageRoutes.js';
import rodentReports from './rodentReports.js';
import restaurants from './restaurants.js';

const constructorMethod = (app) => {
    app.use('/public', staticDir('public'));

    // UI Routes
    app.use('/', pageRoutes);

    // API Routes
    app.use('/rodentReports', rodentReports);
    app.use('/api/restaurants', restaurants);

    app.use((req, res) => {
        res.status(404).render('error');
    });
};

export default constructorMethod;