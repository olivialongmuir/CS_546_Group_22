// ROUTES FOR USERS

// TODO - update to res.render() when we have front end set up
// TODO - import and use validation

import { Router } from 'express';
const router = Router();

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserComments
} from '../data/users.js';

// GET /users
// Grabs all users (by type)
router.route('/').get(async (req, res) => {
  try {
    // Defaults values:
    // type can grab all users by a specific type
    const { type='consumer'} = req.query;

    const users = await getAllUsers({ type });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /users
// Creates a user
router.route('/').post(async (req, res) => {
  try {
    const userData = req.body;

    if (!userData.username || !userData.emailAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newUser = await createUser(userData);

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /users/:id
// Gets a user by id
router.route('/:id').get(async (req, res) => {
  try {
    const id = req.params.id.trim();

    if (!id) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /users/:id
// Updates a users information by id
router.route('/:id').patch(async (req, res) => {
  try {
    const id = req.params.id.trim();
    const updates = req.body;

    const updatedUser = await updateUser(id, updates);

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /users/:id
// Deletes a user
router.route('/:id').delete(async (req, res) => {
  try {
    const id = req.params.id.trim();

    await deleteUser(id);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /users/:id/comments
// Grab user comments by id
router.get('/:id/comments', async (req, res) => {
  try {
    const id = req.params.id.trim();

    const comments = await getUserComments(id);

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;