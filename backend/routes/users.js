const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllUsers, getUserById, createUser,
  updateUser, deleteUser, updateProfile
} = require('../controllers/userController');

router.use(authenticate);

router.get('/', getAllUsers);
router.get('/profile', (req, res) => res.json({ user: req.user }));
router.patch('/profile', updateProfile);
router.get('/:id', getUserById);
router.post('/', authorize('admin'), createUser);
router.put('/:id', updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
