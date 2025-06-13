const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const FormResponse = sequelize.define('FormResponse', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        formId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        responses: {
            type: DataTypes.JSONB,
            defaultValue: {}
        },
        lastModifiedBy: DataTypes.UUID,
        version: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        }
    });

    return FormResponse;
};