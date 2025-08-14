import { Router } from 'express';
import { listGroups, createGroup, updateGroup, deleteGroup } from '../controllers/eventGroup.controller';

const router = Router();

router.get('/', listGroups);
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

export default router;


