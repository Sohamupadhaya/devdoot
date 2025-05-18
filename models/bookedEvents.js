const { DataTypes } = require('sequelize');
const sequelize = require('../config/database')
const { v4: uuidv4 } = require('uuid');

const BookedEvent = sequelize.define('BookedEvent', {
    id:{
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
        allowNull: false,
    },
    topic:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    scheduledAt:{
        type: DataTypes.DATE,
        allowNull: false,
    },
    description:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    location:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId:{
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users', 
            key: 'id',
        },
    },
    createdAt:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    deletedAt:{
        type: DataTypes.DATE,
        allowNull: true,
    },
},
{
    paranoid: true,
});

BookedEvent.associate = (models) => {
BookedEvent.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
});
}

module.exports = BookedEvent;