// ROUTES FOR RESTAURANTS

// TODO - update to res.render() when we have front end set up
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

// GET /restaurants
// Grabs all restaurants data
router.route('/').get(async (req, res) => {
  try {
    // can filter restaurant by type
    const filters = req.query;

    const restaurants = await getAllRestaurants(filters);

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /restaurants
// Creates a restaurant
router.route('/').post(async (req, res) => {
  try {
    const data = req.body;

    if (!data.name) {
      return res.status(400).json({ error: 'Name required' });
    }

    const newRestaurant = await createRestaurant(data);

    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

// PATCH /restaurants/:id
// Updates a restaurant's information by id
router.route('/:id').patch(async (req, res) => {
  try {
    const id = req.params.id.trim();

    if (!id) {
      return res.status(400).json({ error: 'Invalid restaurant ID' });
    }

    const updated = await updateRestaurant(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(200).json(updated);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /restaurants/:id
// deletes a restaurant by id
router.route('/:id').delete(async (req, res) => {
  try {
    await deleteRestaurant(req.params.id);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /restaurants/:id/comments
// Gets all restaurant comments by id
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await getRestaurantComments(req.params.id);

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /restaurants/:id/comments
// Creates a restaurant comment by id
router.post('/:id/comments', async (req, res) => {
  try {
    const comment = await addCommentToRestaurant(req.params.id, req.body);

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /restaurants/:id/rodentReports
// Grabs rodent reports relevant to restaurant by id
router.get('/:id/rodentReports', async (req, res) => {
  try {
    const reports = await getRestaurantRodentReports(req.params.id, req.query);

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;