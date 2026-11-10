import { Router } from 'express';
import * as groups from '../controllers/groupController.js';
import * as members from '../controllers/memberController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { loadMembership, requirePermission } from '../middleware/groupMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { joinLimiter, memberAddLimiter } from '../middleware/rateLimit.js';
import { createGroupSchema, updateGroupSchema } from '../validators/groupValidators.js';
import {
  joinGroupSchema,
  regenerateInviteSchema,
  addMemberSchema,
  setRoleSchema,
} from '../validators/memberValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/', groups.listGroups);
router.post('/', validate(createGroupSchema), groups.createGroup);
router.post('/join', joinLimiter, validate(joinGroupSchema), members.joinGroup);

// Every route below follows the same order: membership first (404 for strangers),
// then permission (403), then input validation (400).
router.get('/:id', loadMembership, requirePermission('group:view'), groups.getGroup);
router.put('/:id', loadMembership, requirePermission('group:edit'), validate(updateGroupSchema), groups.updateGroup);
router.delete('/:id', loadMembership, requirePermission('group:delete'), groups.deleteGroup);

router.post(
  '/:id/invite/regenerate',
  loadMembership,
  requirePermission('invite:manage'),
  validate(regenerateInviteSchema),
  members.regenerateInvite
);
router.post('/:id/leave', loadMembership, requirePermission('group:leave'), members.leaveGroup);

router.post(
  '/:id/members',
  memberAddLimiter,
  loadMembership,
  requirePermission('member:add'),
  validate(addMemberSchema),
  members.addMember
);
router.put(
  '/:id/members/:userId',
  loadMembership,
  requirePermission('member:set-role'),
  validate(setRoleSchema),
  members.setRole
);
router.delete('/:id/members/:userId', loadMembership, requirePermission('member:remove'), members.removeMember);

export default router;