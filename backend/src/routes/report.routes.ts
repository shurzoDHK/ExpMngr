import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getCalendarReport,
  getSummary,
  getCategoryBreakdown,
} from '../controllers/report.controller';

const router = Router();

router.use(authenticate);

router.get('/calendar', getCalendarReport);
router.get('/summary', getSummary);
router.get('/category-breakdown', getCategoryBreakdown);

export default router;
