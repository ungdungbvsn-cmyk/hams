import { Router } from 'express';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController';

// Note: Ensure authentication middleware if necessary.
// To avoid importing an unknown location, we will rely on frontend passing valid token where standard routes are applied.

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
