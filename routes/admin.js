import { Router } from 'express';
import { getPendingUsers, approveUser } from '../data/users.js';
import { validateId } from '../data/utility.js';
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} from '../data/restaurants.js';

import {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport
} from '../data/rodentReports.js';

import { 
    checkWebsite, 
    checkPhone, 
    checkRestaurantStatus, 
    checkRestaurantName,
    checkRestaurantType,
    checkDate, 
    checkDescription, 
    checkJobId, 
    checkNote, 
    checkPhotoUrl, 
    checkRatSizeRating, 
    checkRodentName,
    checkRodentType, 
    checkRodentStatus, 
    checkUserType, 
    checkZipcode, 
    checkLatitude,
    checkLongitude,
} from '../public/js/helpers.js';

const router = Router();

const RESTAURANT_STATUSES = ['sanitary', 'unsanitary', 'inspecting', 'pending'];
const RODENT_STATUSES = ['pending', 'verified', 'disputed', 'removed', 'unverified'];
const VERIFIER_TYPES = ['', 'consumer', 'restaurant', 'exterminator', 'inspector', 'admin'];

// Convert empty form strings to null so optional fields skip validation in the data layer.
const blankToNull = (v) => (v === undefined || v === null || String(v).trim() === '' ? null : v);

router.route('/').get(async (req, res) => {
  try {
    const pendingUsers = await getPendingUsers();
    return res.render('admin', {
      title: 'SqueakPeek - Admin',
      pendingUsers,
      hasPending: pendingUsers.length > 0
    });
  } catch (error) {
    console.error(error);
    return res.status(500).render('error', { title: 'Admin Error' });
  }
});

router.route('/approve/:id').post(async (req, res) => {
  try {
    await approveUser(req.params.id);
    return res.redirect('/admin');
  } catch (error) {
    console.error(error);
    return res.status(400).render('error', { title: 'Approve Failed' });
  }
});

// ----- Restaurants -----

router.route('/restaurants').get(async (req, res) => {
  try {
    const restaurants = await getAllRestaurants();
    return res.render('admin/restaurants', {
      title: 'Admin - Restaurants',
      restaurants,
      hasRestaurants: restaurants.length > 0
    });
  } catch (error) {
    console.error(error);
    return res.status(500).render('error', { title: 'Admin Error' });
  }
});

router.route('/restaurants/new').get((req, res) => {
  return res.render('admin/restaurantForm', {
    title: 'Admin - New Restaurant',
    mode: 'create',
    formAction: '/admin/restaurants',
    statuses: RESTAURANT_STATUSES,
    restaurant: {}
  });
});

router.route('/restaurants').post(async (req, res) => {
  const body = req.body || {};

  try {
    const {
      name,
      type,
      latitude,
      longitude,
      website,
      phone,
      status
    } = body;

    // Input validation
    const validatedName = checkRestaurantName(name);
    const validatedType = checkRestaurantType(type);
    const validatedLatitude = checkLatitude(latitude);
    const validatedLongitude = checkLongitude(longitude);
    const validatedStatus = checkRestaurantStatus(status);

    // Optional
    const validatedWebsite = website != "" ? checkWebsite(website) : null;
    const validatedPhone = phone != "" ? checkPhone(phone) : null;

    const newRestaurant = await createRestaurant(
      validatedName,
      validatedType,
      validatedLatitude,
      validatedLongitude,
      validatedWebsite,
      validatedPhone,
      validatedStatus
    );
    return res.redirect('/admin/restaurants');
  } catch (error) {
    return res.status(400).render('admin/restaurantForm', {
      title: 'Admin - New Restaurant',
      mode: 'create',
      formAction: '/admin/restaurants',
      statuses: RESTAURANT_STATUSES,
      restaurant: body,
      errorMessage: error.toString()
    });
  }
});

router.route('/restaurants/:id/edit').get(async (req, res) => {
  try {
    const restaurant = await getRestaurantById(req.params.id);
    return res.render('admin/restaurantForm', {
      title: 'Admin - Edit Restaurant',
      mode: 'edit',
      formAction: `/admin/restaurants/${restaurant._id}/edit`,
      statuses: RESTAURANT_STATUSES,
      restaurant
    });
  } catch (error) {
    console.error(error);
    return res.status(404).render('error', { title: 'Restaurant Not Found' });
  }
});

router.route('/restaurants/:id/edit').post(async (req, res) => {
  const body = req.body || {};

  try {
    const errorSource = 'POST /admin/restaurants/:id/edit'
    const validatedId = validateId(req.params.id, 'restaurantId', errorSource);

    const {
      name,
      type,
      latitude,
      longitude,
      website,
      phone,
      status
    } = body;

    // Input validation
    const validatedName = checkRestaurantName(name);
    const validatedType = checkRestaurantType(type);
    const validatedLatitude = checkLatitude(latitude);
    const validatedLongitude = checkLongitude(longitude);
    const validatedStatus = checkRestaurantStatus(status);

    // Optional
    const validatedWebsite = website != "" ? checkWebsite(website) : null;
    const validatedPhone = phone != "" ? checkPhone(phone) : null;

    const updated = await updateRestaurant(
      validatedId,
      validatedName,
      validatedType,
      validatedLatitude,
      validatedLongitude,
      validatedWebsite,
      validatedPhone,
      validatedStatus
    );
    return res.redirect('/admin/restaurants');
  } catch (error) {
    return res.status(400).render('admin/restaurantForm', {
      title: 'Admin - Edit Restaurant',
      mode: 'edit',
      formAction: `/admin/restaurants/${req.params.id}/edit`,
      statuses: RESTAURANT_STATUSES,
      restaurant: { _id: req.params.id, ...body },
      errorMessage: error.toString()
    });
  }
});

router.route('/restaurants/:id/delete').post(async (req, res) => {
  try {
    await deleteRestaurant(req.params.id);
    return res.redirect('/admin/restaurants');
  } catch (error) {
    console.error(error);
    return res.status(400).render('error', { title: 'Delete Failed' });
  }
});

// Rodent reports

router.route('/rodent-reports').get(async (req, res) => {
  try {
    const reports = await getAllReports();
    return res.render('admin/rodentReports', {
      title: 'Admin - Rodent Reports',
      reports,
      hasReports: reports.length > 0
    });
  } catch (error) {
    console.error(error);
    return res.status(500).render('error', { title: 'Admin Error' });
  }
});

router.route('/rodent-reports/new').get((req, res) => {
  return res.render('admin/rodentReportForm', {
    title: 'Admin - New Rodent Report',
    mode: 'create',
    formAction: '/admin/rodent-reports',
    statuses: RODENT_STATUSES,
    verifierTypes: VERIFIER_TYPES,
    report: {}
  });
});

router.route('/rodent-reports').post(async (req, res) => {
  const body = req.body || {};

  try {
    const {
      zipcode,
      latitude,
      longitude,
      description,
      reportStatus,
      inspectionDate,
      approvedDate,
      restaurantId,
      verifiedBy
    } = body;

    const errorSource = 'POST /admin/rodent-reports';
    const validatedZipcode = checkZipcode(zipcode);
    const validatedLatitude = checkLatitude(latitude);
    const validatedLongitude = checkLongitude(longitude);
    const validatedStatus = checkRodentStatus(reportStatus);
    const validatedDescription = checkDescription(description);
    const validatedUserId = validateId(req.session.userId, 'userId', errorSource);

    const validatedInspectionDate = restaurantId != "" ? checkDate(inspectionDate) : null;
    const validatedApprovedDate = approvedDate != "" ? checkDate(approvedDate) : null;
    const validatedRestaurantId = restaurantId != "" ? validateId(restaurantId, 'restaurantId', errorSource) : null;

    await createReport(
      null, // jobId
      validatedZipcode,
      validatedLatitude,
      validatedLongitude,
      validatedInspectionDate,
      validatedStatus,
      validatedApprovedDate,
      validatedRestaurantId,
      validatedUserId,
      validatedDescription
    );
    return res.redirect('/admin/rodent-reports');
  } catch (error) {
    return res.status(400).render('admin/rodentReportForm', {
      title: 'Admin - New Rodent Report',
      mode: 'create',
      formAction: '/admin/rodent-reports',
      statuses: RODENT_STATUSES,
      verifierTypes: VERIFIER_TYPES,
      report: body,
      errorMessage: error.toString()
    });
  }
});

router.route('/rodent-reports/:id/edit').get(async (req, res) => {
  try {
    const report = await getReportById(req.params.id);
    return res.render('admin/rodentReportForm', {
      title: 'Admin - Edit Rodent Report',
      mode: 'edit',
      formAction: `/admin/rodent-reports/${report._id}/edit`,
      statuses: RODENT_STATUSES,
      verifierTypes: VERIFIER_TYPES,
      report
    });
  } catch (error) {
    console.error(error);
    return res.status(404).render('error', { title: 'Report Not Found' });
  }
});

router.route('/rodent-reports/:id/edit').post(async (req, res) => {
  const body = req.body || {};

  try {
    let {
      zipcode,
      latitude,
      longitude,
      description,
      reportStatus,
      inspectionDate,
      approvedDate,
      restaurantId,
      verifiedBy
    } = body;

    const errorSource = 'POST /admin/rodent-reports/:id/edit';
    const validatedZipcode = checkZipcode(zipcode);
    const validatedLatitude = checkLatitude(latitude);
    const validatedLongitude = checkLongitude(longitude);
    const validatedStatus = checkRodentStatus(reportStatus);
    const validatedDescription = checkDescription(description);
    const validatedUserId = validateId(req.session.userId, 'userId', errorSource);
    const validatedVerifiedBy = checkUserType(verifiedBy);

    const validatedInspectionDate = restaurantId != "" ? checkDate(inspectionDate) : null;
    const validatedApprovedDate = approvedDate != "" ? checkDate(approvedDate) : null;
    const validatedRestaurantId = restaurantId != "" ? validateId(restaurantId, 'restaurantId', errorSource) : null;

    await updateReport(
      req.params.id,
      undefined, // jobId
      validatedZipcode,
      validatedLatitude,
      validatedLongitude,
      validatedInspectionDate,
      validatedStatus,
      validatedApprovedDate,
      validatedRestaurantId,
      validatedUserId,
      validatedDescription,
      validatedVerifiedBy
    );
    return res.redirect('/admin/rodent-reports');
  } catch (error) {
    return res.status(400).render('admin/rodentReportForm', {
      title: 'Admin - Edit Rodent Report',
      mode: 'edit',
      formAction: `/admin/rodent-reports/${req.params.id}/edit`,
      statuses: RODENT_STATUSES,
      verifierTypes: VERIFIER_TYPES,
      report: { _id: req.params.id, ...body },
      errorMessage: error.toString()
    });
  }
});

router.route('/rodent-reports/:id/delete').post(async (req, res) => {
  try {
    await deleteReport(req.params.id);
    return res.redirect('/admin/rodent-reports');
  } catch (error) {
    console.error(error);
    return res.status(400).render('error', { title: 'Delete Failed' });
  }
});

export default router;