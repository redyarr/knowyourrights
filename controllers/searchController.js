const { User, Lawyer, ProfileImage } = require('../models');
const { Op } = require('sequelize');

// API endpoint for searching users (returns JSON)
exports.apiSearchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 2) {
            return res.json({ users: [] });
        }
        
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { firstName: { [Op.like]: `%${query}%` } },
                    { lastName: { [Op.like]: `%${query}%` } },
                    { email: { [Op.like]: `%${query}%` } }
                ]
            },
            include: [
                {
                    model: ProfileImage,
                    attributes: ['imagePath'],
                },
                {
                    model: Lawyer,
                    required: false
                }
            ],
            limit: 10
        });
        
        return res.json({ users });
    } catch (error) {
        console.error('Error searching users:', error);
        return res.status(500).json({ error: 'An error occurred while searching users' });
    }
};

// Full search page (returns HTML)
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.session?.user_id;
        
        if (!query) {
            return res.render('search/index', { 
                users: [], 
                query: '',
                loggedInUserId: userId
            });
        }
        
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { firstName: { [Op.like]: `%${query}%` } },
                    { lastName: { [Op.like]: `%${query}%` } },
                    { email: { [Op.like]: `%${query}%` } }
                ]
            },
            include: [
                {
                    model: ProfileImage,
                    attributes: ['imagePath'],
                },
                {
                    model: Lawyer,
                    required: false
                }
            ]
        });
        
        return res.render('search/index', { 
            users, 
            query,
            loggedInUserId: userId
        });
    } catch (error) {
        console.error('Error searching users:', error);
        return res.status(500).render('error', { error: 'An error occurred while searching users' });
    }
};