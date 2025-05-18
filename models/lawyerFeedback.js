const {sequelize, DataTypes} = require('../util/db');

const LawyerFeedback = sequelize.define('lawyer_feedbacks', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    lawyer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    review: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    conversation_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Or false if a conversation ID is always required
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
},{
    underscored: true,
    timestamps: true,
    updatedAt: false
});

module.exports = LawyerFeedback;