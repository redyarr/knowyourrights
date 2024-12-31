const Users = require('../models/users');
const Lawyers = require('../models/lawyers');

module.exports = {
    // Controller to fetch all users and their data
    getAllUsers: async (req, res) => {
        try {
            const users = await Users.findAll();
            // Render the users page with users data (name, email, role)
            res.render('user/', { users });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Controller to fetch a specific user's profile by ID
    getUserProfile: async (req, res) => {
        const userId = req.params.id;
        try {
            const user = await Users.findOne({
                where: { user_id: userId },
                include: [
                    {
                        model: Lawyers,
                        attributes: ['law_firm', 'specialization', 'license_number', 'contact_number', 'city', 'country'],
                    },
                ],
            });

            if (!user) {
                return res.status(404).send('User not found');
            }

            // Render the user's profile page with all details
            res.render('user/profile', { user });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            res.status(500).send('Internal Server Error');
        }
    },
};
