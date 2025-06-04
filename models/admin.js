const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");
const { v4: uuidv4 } = require("uuid");

const Admin = sequelize.define("Admin", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'admins',
    timestamps: true,
});

module.exports = Admin;
