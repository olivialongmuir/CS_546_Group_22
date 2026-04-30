import { Router } from 'express';
import { getPendingUsers, approveUser } from '../data/users.js';

const router = Router();

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

export default router;
