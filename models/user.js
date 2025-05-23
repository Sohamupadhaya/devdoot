const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const User = sequelize.define('User', {
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
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  dob: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: false,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // googleId: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  //   unique: false,
  // },
  // googleRefreshToken: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  // },
}, {
  tableName: 'users',
  timestamps: true,
});
User.associate = (models) => {
  User.hasMany(models.Kundali, {
    foreignKey: 'userId',
    as: 'kundalis',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};
module.exports = User;
