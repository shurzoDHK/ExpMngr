import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getLoans,
  createLoan,
  getLoanAmortization,
  makeLoanPayment,
  updateLoan,
  deleteLoan,
} from '../controllers/loan.controller';

const router = Router();

router.use(authenticate);

router.get('/', getLoans);
router.post('/', createLoan);
router.get('/:id/amortization', getLoanAmortization);
router.post('/payment', makeLoanPayment);
router.put('/:id', updateLoan);
router.delete('/:id', deleteLoan);

export default router;
