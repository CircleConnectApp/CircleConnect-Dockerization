const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/database');

const Community = sequelize.define('Community', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  language: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'communities',
  timestamps: false 
});

module.exports = Community;