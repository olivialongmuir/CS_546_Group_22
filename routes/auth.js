import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { users } from '../config/mongoCollections.js';
import { createUser } from '../data/users.js';
import { 
    checkEmail, 
    checkFirstName, 
    checkLastName, 
    checkPassword, 
    checkUsername, 
    checkUserType,
} from '../helpers.js';

const router = Router();

const USER_TYPE_OPTIONS = [
  { value: 'consumer',     label: 'Consumer' },
  { value: 'inspector',    label: 'Health Inspector' },
  { value: 'restaurant',   label: 'Restaurant Owner' },
  { value: 'exterminator', label: 'Exterminator' }
];

const buildTypeOptions = (selected) => {
  return USER_TYPE_OPTIONS.map(o => ({ ...o, selected: o.value === selected }));
};

router
  .route('/login')
  .get(async (req, res) => {
    return res.render('login', { title: 'SqueakPeek - Login' });
  })
  .post(async (req, res) => {
    let user = null;

    try {
      const { 
        username, 
        password 
      } = req.body;

      // Project requirement - 3 stage validation in client, route, server
      const validatedUsername = checkUsername(username);
      const validatedPassword = checkPassword(password);

      const usersCollection = await users();
      user = await usersCollection.findOne({ username: validatedUsername });

      if (!user) throw 'Invalid username or password';
      if (!user.hashPassword) throw 'No password set for this account';

      const match = await bcrypt.compare(validatedPassword, user.hashPassword);
      if (!match) throw 'Invalid username or password';

      if (!user.approved) throw 'Your account is awaiting admin approval';
    } catch(error) {
      console.error(error);
      return res.status(400).render('login', {
        title: 'SqueakPeek - Login',
        error: error
      });
    }

    try {
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

router
  .route('/register')
  .get(async (req, res) => {
    return res.render('register', {
      title: 'SqueakPeek - Register',
      typeOptions: buildTypeOptions()
    });
  })
  .post(async (req, res) => {
    try {
      const { 
        firstName, 
        lastName, 
        username, 
        emailAddress, 
        password, 
        confirmPassword, 
        type 
      } = req.body;

      // Project requirement - 3 stage validation in client, route, server
      const validatedFirstName = checkFirstName(firstName);
      const validatedLastName = checkLastName(lastName);
      const validatedUsername = checkUsername(username);
      const validatedPassword = checkPassword(password);
      const validatedEmail = checkEmail(emailAddress);
      const validatedType = checkUserType(type);

      if (validatedPassword !== confirmPassword) throw 'Passwords do not match';

      const newUser = await createUser(
        validatedFirstName,
        validatedLastName,
        validatedUsername,
        validatedPassword,
        validatedEmail,
        validatedType
      );

      // Regular users are automatically approved
      if (newUser.type === 'consumer') {
        req.session.userId = newUser._id;
        req.session.userType = newUser.type;
        return res.redirect('/profile');
      }

      // Special users need to be approved first
      return res.redirect('/registration-submitted');
    } catch(error) {
      return res.status(400).render('register', {
        title: 'SqueakPeek - Register',
        error: error
      });
    }
  });

router.route('/registration-submitted').get(async (req, res) => {
  return res.render('registration-submitted', {
    title: 'SqueakPeek - Registration Submitted'
  });
});

router.route('/logout').get(async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

export default router;
