import * as memberService from '../services/memberService.js';
import * as groupService from '../services/groupService.js';

export async function regenerateInvite(req, res) {
  const invite = await memberService.regenerateInvite(req.params.id, req.body);
  res.json({ inviteCode: invite.inviteCode, inviteExpiresAt: invite.inviteExpiresAt });
}

export async function joinGroup(req, res) {
  const { groupId, membership } = await memberService.joinGroup(req.user, req.body.code);
  const group = await groupService.getGroupDetails(groupId, membership);
  res.json({ group });
}

export async function addMember(req, res) {
  await memberService.addMemberByEmail(req.user, req.params.id, req.body.email);
  // Identical for every outcome on purpose (see memberService).
  res.json({ message: 'If an account with that email exists, it has been added to the group.' });
}

export async function setRole(req, res) {
  const member = await memberService.setMemberRole(
    req.user,
    req.membership,
    req.params.id,
    req.params.userId,
    req.body.role
  );
  res.json({ member });
}

export async function removeMember(req, res) {
  await memberService.removeMember(req.user, req.membership, req.params.id, req.params.userId);
  res.json({ message: 'Member removed' });
}

export async function leaveGroup(req, res) {
  await memberService.leaveGroup(req.user, req.membership);
  res.json({ message: 'You left the group' });
}