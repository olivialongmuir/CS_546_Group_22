// ROUTES FOR RESTAURANTS

import { Router } from 'express';
const router = Router();

import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantComments,
  getRestaurantRodentReports
} from '../data/restaurants.js';

import { 
    checkWebsite, 
    checkPhone, 
    checkRestaurantStatus, 
    checkLatitude,
    checkLongitude,
    checkRestaurantName,
    checkRestaurantType
} from '../public/js/helpers.js';

import { validateId } from '../data/utility.js';

// Error handling helper function
const handleError = (res, error) => {
  const message = error.toString();
  // 404 error - not found
  if (message.includes('No restaurant')) return res.status(404).json({ error: message });
  // 400 error - bad request
  if (message.includes('Error:')) return res.status(400).json({ error: message });
  // 500 error - internal server error
  return res.status(500).json({ error: error.message });
};

// GET /restaurants
// Grabs all restaurants data
router.route('/').get(async (req, res) => {
  try {
    // can filter restaurant by type
    const filters = req.query;

    const restaurants = await getAllRestaurants(filters);

    res.json(restaurants);
  } catch (error) {
    handleError(res, error);
  }
});

// POST /restaurants
// Creates a restaurant
router.route('/').post(async (req, res) => {
  
  console.log("hit")
  console.log(req.body)
  
  try {
    const {
      name,
      type,
      latitude,
      longitude,
      website,
      phone,
      status
    } = req.body;

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

    res.status(201).json(newRestaurant);
  } catch (error) {
    handleError(res, error);
  }
});

// GET /restaurants/:id
// Gets restaurant data by id
router.route('/:id').get(async (req, res) => {
  try {
    const errorSource = 'GET restaurant/:id';
    const validatedId = validateId(req.params.id, 'restaurantId', errorSource);

    const restaurant = await getRestaurantById(validatedId);

    if (!restaurant) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(restaurant);
  } catch (error) {
    handleError(res, error);
  }
});

// PATCH /restaurants/:id
// Updates a restaurant's information by id
router.route('/:id').patch(async (req, res) => {
  try {
    const errorSource = 'PATCH /restaurant/:id';
    const validatedId = validateId(req.params.id, 'restaurantId', errorSource);

    let {
      name,
      type,
      latitude,
      longitude,
      website,
      phone,
      status
    } = req.body;

    // Input validation
    if (name !== undefined) name = checkRestaurantName(name);
    if (type !== undefined) type = checkRestaurantType(type);
    if (latitude !== undefined) latitude = checkLatitude(latitude);
    if (longitude !== undefined) longitude = checkLongitude(longitude);
    if (status !== undefined) status = checkRestaurantStatus(status);

    // Optional
    if (website !== undefined) website = website != "" ? checkWebsite(website) : null;
    if (phone !== undefined) phone = phone != "" ? checkPhone(phone) : null;

    const updated = await updateRestaurant(
      validatedId,
      name,
      type,
      latitude,
      longitude,
      website,
      phone,
      status
    );

    res.status(200).json(updated);

  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
});

// DELETE /restaurants/:id
// deletes a restaurant by id
router.route('/:id').delete(async (req, res) => {
  try {
    const errorSource = 'DELETE /restaurant/:id';
    const validatedId = validateId(req.params.id, 'restaurantId', errorSource);
    await deleteRestaurant(validatedId);

    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
});

// GET /restaurants/:id/comments
// Gets all restaurant comments by id
router.get('/:id/comments', async (req, res) => {
  try {
    const errorSource = 'GET /restaurant/:id/comments';
    const validatedId = validateId(req.params.id, 'restaurantId', errorSource);

    const comments = await getRestaurantComments(validatedId);

    res.status(200).json(comments);
  } catch (error) {
    handleError(res, error);
  }
});

// POST /restaurants/:id/comments
// Creates a restaurant comment by id
router.post('/:id/comments', async (req, res) => {
  try {
    // requires a bit more refining before completing this route

    res.status(201).json(comment);
  } catch (error) {
    handleError(res, error);
  }
});

// GET /restaurants/:id/rodentReports
// Grabs rodent reports relevant to restaurant by id
router.get('/:id/rodentReports', async (req, res) => {
  try {
    const reports = await getRestaurantRodentReports(req.params.id, req.query);

    res.status(200).json(reports);
  } catch (error) {
    handleError(res, error);
  }
});

export default router;