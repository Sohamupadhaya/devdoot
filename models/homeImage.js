const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const homeImage = sequelize.define('HomeImage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: uuidv4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  smallImage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  homeImage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  flag: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

}, {
  tableName: 'homeImages',
  timestamps: true,
});

module.exports = homeImage;
