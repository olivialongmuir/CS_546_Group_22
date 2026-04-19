// ROUTES FOR RESTAURANTS

// TODO - import and use validation

import { Router } from 'express';
const router = Router();

import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantComments,
  addCommentToRestaurant,
  getRestaurantRodentReports
} from '../data/restaurants.js';

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
  try {
    const {
      name,
      type,
      latitude,
      longitude,
      website,
      phone,
      permit_number,
      status
    } = req.body;

    const newRestaurant = await createRestaurant(
      name,
      type,
      latitude,
      longitude,
      website,
      phone,
      permit_number,
      status
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
    const id = req.params.id.trim();

    const restaurant = await getRestaurantById(id);

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
    const id = req.params.id.trim();

    const {
      name,
      type,
      latitude,
      longitude,
      website,
      phone,
      permit_number,
      status
    } = req.body;

    const updated = await updateRestaurant(
      id,
      name,
      type,
      latitude,
      longitude,
      website,
      phone,
      permit_number,
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
    await deleteRestaurant(req.params.id);

    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
});

// GET /restaurants/:id/comments
// Gets all restaurant comments by id
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await getRestaurantComments(req.params.id);

    res.status(200).json(comments);
  } catch (error) {
    handleError(res, error);
  }
});

// POST /restaurants/:id/comments
// Creates a restaurant comment by id
router.post('/:id/comments', async (req, res) => {
  try {
    const comment = await addCommentToRestaurant(req.params.id, req.body);

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