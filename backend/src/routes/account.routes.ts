import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../controllers/account.controller';

const router = Router();

router.use(authenticate);

router.get('/', getAccounts);
router.post('/', createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

export default router;
