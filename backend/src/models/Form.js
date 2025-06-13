const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Form = sequelize.define('Form', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        shareCode: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        fields: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: []
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: false
        }
    });

    return Form;
};