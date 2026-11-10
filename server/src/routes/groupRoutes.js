import { Router } from 'express';
import * as groups from '../controllers/groupController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { loadMembership, requirePermission } from '../middleware/groupMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createGroupSchema, updateGroupSchema } from '../validators/groupValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/', groups.listGroups);
router.post('/', validate(createGroupSchema), groups.createGroup);

// Order matters: membership first (404 for strangers), then permission (403), then validation (400).
router.get('/:id', loadMembership, requirePermission('group:view'), groups.getGroup);
router.put('/:id', loadMembership, requirePermission('group:edit'), validate(updateGroupSchema), groups.updateGroup);
router.delete('/:id', loadMembership, requirePermission('group:delete'), groups.deleteGroup);

export default router;