const Community = require('../models/Community');
const logger = require('../utils/logger');
const { sequelize } = require('../database/database');

const createUserCommunityModel = async () => {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_communities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, community_id)
      );
    `);
    logger.info('UserCommunity table checked/created');
  } catch (error) {
    logger.error('Error creating UserCommunity table:', error);
    throw error;
  }
};


const createCommunity = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create communities' });
    }

    const { name, language, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Community name is required' });
    }

    const community = await Community.create({ name, language, description });
    logger.info(`Admin ${req.user.id} created community: ${name}`);
    return res.status(201).json(community);
  } catch (error) {
    logger.error('Error creating community:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.findAll();
    return res.status(200).json(communities);
  } catch (error) {
    logger.error('Error fetching communities:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


const getCommunityById = async (req, res) => {
  try {
    const communityId = req.params.id;
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    return res.status(200).json(community);
  } catch (error) {
    logger.error('Error fetching community:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


const joinCommunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const communityId = req.params.id;

    
    logger.debug(`User ID: ${userId}, Community ID: ${communityId}`);
    
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    await createUserCommunityModel();

    await sequelize.query(
      `
      INSERT INTO user_communities (user_id, community_id)
      VALUES (:userId, :communityId)
      ON CONFLICT (user_id, community_id) DO NOTHING;
      `,
      {
        replacements: { userId, communityId },
        type: sequelize.QueryTypes.INSERT,
      }
    );

    logger.info(`User ${userId} joined community ${communityId}`);
    return res.status(200).json({ message: 'Successfully joined community' });
  } catch (error) {
    logger.error('Error joining community:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const leaveCommunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const communityId = req.params.id;

    logger.debug(`User ID: ${userId}, Community ID: ${communityId}`);

    await createUserCommunityModel();

    const result = await sequelize.query(
      `
      DELETE FROM user_communities
      WHERE user_id = :userId AND community_id = :communityId;
      `,
      {
        replacements: { userId, communityId },
        type: sequelize.QueryTypes.DELETE,
      }
    );

    if (result[1] === 0) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    logger.info(`User ${userId} left community ${communityId}`);
    return res.status(200).json({ message: 'Successfully left community' });
  } catch (error) {
    logger.error('Error leaving community:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getCommunityMembers = async (req, res) => {
  try {
    const communityId = req.params.id;

    logger.debug(`Extracted Community ID: ${communityId}`);

    const community = await Community.findByPk(communityId);
    if (!community) {
      logger.warn(`Community with ID ${communityId} not found`);
      return res.status(404).json({ error: 'Community not found' });
    }

    await createUserCommunityModel();

    const members = await sequelize.query(
      `
      SELECT u.id, u.name, u.email, u.profile_picture, uc.joined_at
      FROM users u
      JOIN user_communities uc ON u.id = uc.user_id
      WHERE uc.community_id = :communityId
      ORDER BY uc.joined_at ASC;
      `,
      {
        replacements: { communityId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    logger.debug(`Fetched Members: ${JSON.stringify(members)}`);

    return res.status(200).json(members);
  } catch (error) {
    logger.error('Error fetching community members:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserCommunities = async (req, res) => {
  try {
    const userId = req.user.id;

    logger.debug(`Extracted User ID: ${userId}`);

    await createUserCommunityModel();

    const communities = await sequelize.query(
      `
      SELECT c.*
      FROM communities c
      JOIN user_communities uc ON c.id = uc.community_id
      WHERE uc.user_id = :userId;
      `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    logger.debug(`Fetched Communities: ${JSON.stringify(communities)}`);

    return res.status(200).json(communities);
  } catch (error) {
    logger.error('Error fetching user communities:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createCommunity,
  getAllCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  getUserCommunities
};