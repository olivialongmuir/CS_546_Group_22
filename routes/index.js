// INDEX FOR ROUTES
import {static as staticDir} from 'express';
import pageRoutes from './pageRoutes.js';
import rodentReports from './rodentReports.js';
import restaurants from './restaurants.js';
import authRoutes from './auth.js';
import adminRoutes from './admin.js';

const constructorMethod = (app) => {
    app.use('/public', staticDir('public'));

    // UI Routes
    app.use('/', authRoutes);
    app.use('/admin', adminRoutes);
    app.use('/', pageRoutes);

    // API Routes
    app.use('/rodentReports', rodentReports);
    app.use('/api/restaurants', restaurants);

    // catch all
    app.use(/(.*)/, (req, res) => {
        return res.status(404).render('error', {
        title: 'Error',
        error: 'Page not found'
        });
    });
};

export default constructorMethod;