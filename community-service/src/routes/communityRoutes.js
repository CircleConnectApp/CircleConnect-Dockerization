const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', communityController.getAllCommunities);
router.get('/:id', communityController.getCommunityById);

router.post('/:id/join', authMiddleware, communityController.joinCommunity);
router.delete('/:id/leave', authMiddleware, communityController.leaveCommunity);
router.get('/user/communities', authMiddleware, communityController.getUserCommunities);

router.get('/:id/members', authMiddleware, communityController.getCommunityMembers);

router.post('/', authMiddleware, adminMiddleware, communityController.createCommunity);

module.exports = router; 