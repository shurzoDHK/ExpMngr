import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  processSubscriptionPayment,
} from '../controllers/subscription.controller';

const router = Router();

router.use(authenticate);

router.get('/', getSubscriptions);
router.post('/', createSubscription);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);
router.post('/:id/process-payment', processSubscriptionPayment);

export default router;
