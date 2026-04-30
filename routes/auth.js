import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { users } from '../config/mongoCollections.js';
import { createUser } from '../data/users.js';

const router = Router();

const USER_TYPE_OPTIONS = [
  { value: 'consumer',     label: 'Consumer' },
  { value: 'inspector',    label: 'Health Inspector' },
  { value: 'restaurant',   label: 'Restaurant Owner' },
  { value: 'exterminator', label: 'Exterminator' }
];

const buildTypeOptions = (selected) =>
  USER_TYPE_OPTIONS.map(o => ({ ...o, selected: o.value === selected }));

router.route('/login').get(async (req, res) => {
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

    if (user.approved === false) {
      return renderError('Your account is awaiting admin approval');
    }

    req.session.userId = user._id.toString();
    req.session.userType = user.type;
    return res.redirect('/profile');
  } catch (error) {
    console.error(error);
    return res.status(500).render('login', {
      title: 'SqueakPeek - Login',
      error: 'Something went wrong. Please try again.'
    });
  }
});

router.route('/register').get(async (req, res) => {
  return res.render('register', {
    title: 'SqueakPeek - Register',
    typeOptions: buildTypeOptions()
  });
});

router.route('/register').post(async (req, res) => {
  const { firstName, lastName, username, emailAddress, password, confirmPassword, type } = req.body;

  const renderError = (message) =>
    res.status(400).render('register', {
      title: 'SqueakPeek - Register',
      error: message,
      firstName,
      lastName,
      username,
      emailAddress,
      typeOptions: buildTypeOptions(type)
    });

  if (password !== confirmPassword) {
    return renderError('Passwords do not match');
  }

  try {
    const newUser = await createUser({
      firstName,
      lastName,
      username,
      emailAddress,
      password,
      type
    });
    if (newUser.type === 'consumer') {
      req.session.userId = newUser._id;
      req.session.userType = newUser.type;
      return res.redirect('/profile');
    }
    return res.redirect('/registration-submitted');
  } catch (error) {
    console.error(error);
    const message = typeof error === 'string'
      ? error.replace(/^Error:\s*/, '')
      : (error?.message || 'Something went wrong. Please try again.');
    return renderError(message);
  }
});

router.route('/registration-submitted').get(async (req, res) => {
  return res.render('registration-submitted', { title: 'SqueakPeek - Registration Submitted' });
});

router.route('/logout').get(async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

export default router;
