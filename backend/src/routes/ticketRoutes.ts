import { Router } from 'express';
import { getTickets, createTicket, updateTicketStatus } from '../controllers/ticketController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getTickets);
router.post('/', createTicket);
router.put('/:id/status', authorizeRoles('ADMIN', 'IT'), updateTicketStatus);

export default router;
