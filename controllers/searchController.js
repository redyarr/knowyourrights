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
        // Always render results.ejs, never index.ejs
        if (!query) {
            return res.render('search/results', {
                results: [],
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
            ],
            limit: 20
        });
        // Map users to a generic result format for the template
        const results = users.map(user => ({
            title: user.firstName + ' ' + user.lastName,
            summary: user.email,
            link: '/in/' + user.id
        }));
        return res.render('search/results', {
            results,
            query,
            loggedInUserId: userId
        });
    } catch (error) {
        console.error('Error searching users:', error);
        return res.status(500).render('error', { error: 'An error occurred while searching users' });
    }
};