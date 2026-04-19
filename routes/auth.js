import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { users } from '../config/mongoCollections.js';

const router = Router();

router.route('/login').get(async (req, res) => {
  if (req.session.userId) return res.redirect('/profile');
  return res.render('login', { title: 'SqueakPeek - Login' });
});

router.route('/login').post(async (req, res) => {
  const { username, password } = req.body;

  const renderError = (message) =>
    res.status(400).render('login', {
      title: 'SqueakPeek - Login',
      error: message,
      username
    });

  if (typeof username !== 'string' || username.trim().length === 0) {
    return renderError('Username is required');
  }
  if (typeof password !== 'string' || password.length === 0) {
    return renderError('Password is required');
  }

  try {
    const usersCollection = await users();
    const user = await usersCollection.findOne({ username: username.trim() });

    if (!user) return renderError('Invalid username or password');
    if (!user.hashPassword) return renderError('No password set for this account');

    const match = await bcrypt.compare(password, user.hashPassword);
    if (!match) return renderError('Invalid username or password');

    req.session.userId = user._id.toString();
    return res.redirect('/profile');
  } catch (error) {
    console.error(error);
    return res.status(500).render('login', {
      title: 'SqueakPeek - Login',
      error: 'Something went wrong. Please try again.'
    });
  }
});

router.route('/logout').get(async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

export default router;
