import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
  getAllUsers,
  getUser,
  updateUser,
  changePassword,
  deleteUser,
} from '../controllers/user.controller';

const router = Router();

router.use(authenticate);

router.get('/me', getUser);
router.put('/me', updateUser);
router.post('/change-password', changePassword);

router.get('/', requireAdmin, getAllUsers);
router.delete('/:id', requireAdmin, deleteUser);

export default router;
