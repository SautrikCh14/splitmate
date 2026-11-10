import * as groupService from '../services/groupService.js';

export async function createGroup(req, res) {
  const group = await groupService.createGroup(req.user.id, req.body);
  res.status(201).json({ group });
}

export async function listGroups(req, res) {
  const groups = await groupService.listGroups(req.user.id);
  res.json({ groups });
}

export async function getGroup(req, res) {
  const group = await groupService.getGroupDetails(req.params.id, req.membership);
  res.json({ group });
}

export async function updateGroup(req, res) {
  const group = await groupService.updateGroup(req.params.id, req.body, req.membership);
  res.json({ group });
}

export async function deleteGroup(req, res) {
  await groupService.deleteGroup(req.params.id);
  res.json({ message: 'Group deleted' });
}