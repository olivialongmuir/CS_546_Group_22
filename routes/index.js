// INDEX FOR ROUTES
import {static as staticDir} from 'express';
import pageRoutes from './pageRoutes.js'

const constructorMethod = (app) => {
    app.use('/', pageRoutes);
    app.use('/public', staticDir('public'));
    app.use(/(.*)/, (req, res) => {
        res.status(404).render('error');
    });
};

export default constructorMethod;